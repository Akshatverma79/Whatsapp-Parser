import { ParsedMessage, MessageType, ChatParticipant } from '@/types';

// Participant colors (WhatsApp-style rainbow for group chats)
const PARTICIPANT_COLORS = [
  '#00a884', '#25d366', '#34b7f1', '#ff6b6b',
  '#ffd93d', '#c77dff', '#ff8500', '#06d6a0',
];

function detectMessageType(text: string, mediaFilename?: string): MessageType {
  if (!text && !mediaFilename) return 'text';
  if (mediaFilename) {
    const ext = mediaFilename.split('.').pop()?.toLowerCase() ?? '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(ext)) return 'image';
    if (['mp4', 'mov', 'avi', 'mkv', '3gp'].includes(ext)) return 'video';
    if (['mp3', 'ogg', 'opus', 'm4a', 'aac', 'wav'].includes(ext)) return 'audio';
    if (['webp'].includes(ext)) return 'sticker';
    return 'document';
  }
  const lower = text.toLowerCase();
  if (lower === 'this message was deleted' || lower === 'you deleted this message') return 'deleted';
  if (lower.includes('location:') || lower.startsWith('https://maps.google.com') || lower.startsWith('https://maps.apple.com')) return 'location';
  return 'text';
}

function isSystemMessage(sender: string): boolean {
  return (
    sender === '' ||
    sender === 'System' ||
    sender.includes('Messages and calls are end-to-end encrypted') ||
    false
  );
}

function buildId(date: Date, index: number): string {
  return `${date.getTime()}-${index}`;
}

export interface RawParsedMessage {
  date: Date;
  author: string;
  message: string;
}

export function parseWhatsAppChat(rawText: string): {
  messages: ParsedMessage[];
  participants: ChatParticipant[];
} {
  const lines = rawText.split('\n');
  const rawMessages: RawParsedMessage[] = [];

  // Support both Android and iOS export formats
  // Android: DD/MM/YYYY, HH:MM - Sender: Message
  // iOS:     [DD/MM/YYYY, HH:MM:SS] Sender: Message
  // Also: M/D/YY, H:MM AM/PM format
  const androidRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2}(?::\d{2})?\s?(?:AM|PM|am|pm)?) - (.*)/;
  const iosRegex = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2}(?::\d{2})?\s?(?:AM|PM|am|pm)?)\] (.*)/;

  let current: RawParsedMessage | null = null;

  for (const line of lines) {
    const androidMatch = line.match(androidRegex);
    const iosMatch = line.match(iosRegex);
    const match = androidMatch || iosMatch;

    if (match) {
      if (current) rawMessages.push(current);
      const [, datePart, timePart, rest] = match;
      const dateStr = `${datePart} ${timePart}`.trim();
      let parsedDate: Date;
      try {
        // Normalize date - handle DD/MM/YYYY
        const parts = datePart.split('/');
        let year = parseInt(parts[2]);
        if (year < 100) year += 2000;
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[0]);
        const timeCleaned = timePart.replace('\u202f', ' ');
        parsedDate = new Date(year, month, day);
        // parse time
        const timeMatch = timeCleaned.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s?(AM|PM|am|pm))?/);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const seconds = parseInt(timeMatch[3] ?? '0');
          const meridiem = timeMatch[4]?.toUpperCase();
          if (meridiem === 'PM' && hours < 12) hours += 12;
          if (meridiem === 'AM' && hours === 12) hours = 0;
          parsedDate.setHours(hours, minutes, seconds);
        }
      } catch {
        parsedDate = new Date(dateStr);
      }

      const colonIdx = rest.indexOf(': ');
      let sender = '';
      let message = rest;
      if (colonIdx !== -1) {
        sender = rest.substring(0, colonIdx).trim();
        message = rest.substring(colonIdx + 2).trim();
      }

      // Remove Unicode left-to-right mark that WhatsApp sometimes adds
      sender = sender.replace(/\u202a|\u202c|\u200e/g, '').trim();
      message = message.replace(/\u200e/g, '').trim();

      current = { date: parsedDate, author: sender, message };
    } else if (current) {
      // Continuation of previous message (multi-line)
      current.message += '\n' + line;
    }
  }
  if (current) rawMessages.push(current);

  // Build participant map
  const participantMap = new Map<string, number>();
  for (const msg of rawMessages) {
    if (msg.author && !isSystemMessage(msg.author)) {
      participantMap.set(msg.author, (participantMap.get(msg.author) ?? 0) + 1);
    }
  }

  const participants: ChatParticipant[] = Array.from(participantMap.entries()).map(
    ([name, count], idx) => ({
      name,
      messageCount: count,
      color: PARTICIPANT_COLORS[idx % PARTICIPANT_COLORS.length],
    })
  );

  // Parse media filenames
  // WhatsApp attaches media like: IMG-20230101-WA0001.jpg (attached)  or  ‎image omitted
  const mediaAttachedRegex = /(.+?)\s*\(file attached\)|(.+?)\s*<attached>/i;
  const mediaOmittedRegex = /^(image|video|audio|document|sticker|GIF) omitted$/i;

  const messages: ParsedMessage[] = rawMessages.map((raw, idx) => {
    let text = raw.message;
    let mediaFilename: string | undefined;
    let isForwarded = false;
    let isDeleted = false;

    // Check for forwarded indicator
    if (text.startsWith('Forwarded') || text.includes('\u202aForwarded\u202c')) {
      isForwarded = true;
      text = text.replace(/^\u202aForwarded\u202c\s*/i, '').replace(/^Forwarded\s*/i, '').trim();
    }

    // Check for attached file
    const attachedMatch = text.match(mediaAttachedRegex);
    if (attachedMatch) {
      mediaFilename = (attachedMatch[1] || attachedMatch[2]).trim();
      text = '';
    }

    // Check for omitted media (exported without media files)
    const omittedMatch = text.match(mediaOmittedRegex);
    if (omittedMatch) {
      mediaFilename = `__omitted__.${omittedMatch[1].toLowerCase()}`;
      text = `[${omittedMatch[1]} omitted]`;
    }

    const type = isSystemMessage(raw.author)
      ? 'system'
      : detectMessageType(text, mediaFilename && !mediaFilename.startsWith('__omitted__') ? mediaFilename : undefined);

    if (type === 'deleted') isDeleted = true;

    return {
      id: buildId(raw.date, idx),
      date: raw.date,
      sender: raw.author,
      text,
      type,
      mediaFilename,
      isForwarded,
      isDeleted,
      isOwn: false, // will be set after owner selection
    };
  });

  return { messages, participants };
}

export function applyOwner(messages: ParsedMessage[], ownerName: string): ParsedMessage[] {
  return messages.map((m) => ({ ...m, isOwn: m.sender === ownerName }));
}
