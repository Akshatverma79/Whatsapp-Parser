export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'sticker'
  | 'location'
  | 'contact'
  | 'system'
  | 'deleted'
  | 'forwarded_text'
  | 'poll';

export interface ParsedMessage {
  id: string;
  date: Date;
  sender: string;
  text: string;
  type: MessageType;
  mediaFilename?: string;
  blobUrl?: string;
  isForwarded?: boolean;
  isDeleted?: boolean;
  replyTo?: string;
  /** Set after "who is you" selection */
  isOwn?: boolean;
}

export interface ChatParticipant {
  name: string;
  messageCount: number;
  color: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ParsedMessage[];
  participants: ChatParticipant[];
  startDate: Date;
  endDate: Date;
  /** name of the participant who is "you" */
  ownerName: string | null;
}

export interface BlobStore {
  [filename: string]: string; // filename → object URL
}
