import Dexie, { type EntityTable } from 'dexie';
import { ParsedMessage, ChatParticipant } from '@/types';

interface StoredSession {
  id: string;
  title: string;
  ownerName: string | null;
  startDate: number;
  endDate: number;
  participantsJson: string;
  createdAt: number;
}

interface StoredMessage {
  id: string;
  sessionId: string;
  date: number;
  sender: string;
  text: string;
  type: string;
  mediaFilename: string | null;
  isForwarded: boolean;
  isDeleted: boolean;
  isOwn: boolean;
}

interface StoredBlob {
  id: string; // `${sessionId}::${filename}`
  sessionId: string;
  filename: string;
  blob: Blob;
  mimeType: string;
}

class WhatsAppDB extends Dexie {
  sessions!: EntityTable<StoredSession, 'id'>;
  messages!: EntityTable<StoredMessage, 'id'>;
  blobs!: EntityTable<StoredBlob, 'id'>;

  constructor() {
    super('whatsapp-parser');
    this.version(1).stores({
      sessions: 'id, createdAt',
      messages: 'id, sessionId, date',
      blobs: 'id, sessionId',
    });
  }
}

const db = new WhatsAppDB();

export async function saveSession(
  sessionId: string,
  title: string,
  ownerName: string | null,
  messages: ParsedMessage[],
  participants: ChatParticipant[],
  blobStore: Record<string, string>
): Promise<void> {
  const now = Date.now();
  const dates = messages.map((m) => m.date.getTime());
  const startDate = Math.min(...dates);
  const endDate = Math.max(...dates);

  await db.sessions.put({
    id: sessionId,
    title,
    ownerName,
    startDate,
    endDate,
    participantsJson: JSON.stringify(participants),
    createdAt: now,
  });

  const storedMessages: StoredMessage[] = messages.map((m) => ({
    id: m.id,
    sessionId,
    date: m.date.getTime(),
    sender: m.sender,
    text: m.text,
    type: m.type,
    mediaFilename: m.mediaFilename ?? null,
    isForwarded: m.isForwarded ?? false,
    isDeleted: m.isDeleted ?? false,
    isOwn: m.isOwn ?? false,
  }));

  await db.messages.bulkPut(storedMessages);

  // Store blobs in IndexedDB
  for (const [filename, url] of Object.entries(blobStore)) {
    const resp = await fetch(url);
    const blob = await resp.blob();
    await db.blobs.put({
      id: `${sessionId}::${filename}`,
      sessionId,
      filename,
      blob,
      mimeType: blob.type,
    });
  }
}

export async function loadSession(sessionId: string): Promise<{
  session: StoredSession;
  messages: ParsedMessage[];
  participants: ChatParticipant[];
  blobStore: Record<string, string>;
} | null> {
  const session = await db.sessions.get(sessionId);
  if (!session) return null;

  const storedMessages = await db.messages
    .where('sessionId')
    .equals(sessionId)
    .sortBy('date');

  const messages: ParsedMessage[] = storedMessages.map((m) => ({
    id: m.id,
    date: new Date(m.date),
    sender: m.sender,
    text: m.text,
    type: m.type as ParsedMessage['type'],
    mediaFilename: m.mediaFilename ?? undefined,
    isForwarded: m.isForwarded,
    isDeleted: m.isDeleted,
    isOwn: m.isOwn,
  }));

  const storedBlobs = await db.blobs
    .where('sessionId')
    .equals(sessionId)
    .toArray();

  const blobStore: Record<string, string> = {};
  for (const sb of storedBlobs) {
    blobStore[sb.filename] = URL.createObjectURL(sb.blob);
  }

  const participants: ChatParticipant[] = JSON.parse(session.participantsJson);

  return { session, messages, participants, blobStore };
}

export async function listSessions(): Promise<StoredSession[]> {
  return db.sessions.orderBy('createdAt').reverse().toArray();
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.sessions.delete(sessionId);
  await db.messages.where('sessionId').equals(sessionId).delete();
  await db.blobs.where('sessionId').equals(sessionId).delete();
}

export default db;
