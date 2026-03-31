import { ParsedMessage, MessageType, ChatParticipant } from '@/types';

// Participant colors (WhatsApp-style rainbow for group chats)
const PARTICIPANT_COLORS = [
  '#00a884', '#25d366', '#34b7f1', '#ff6b6b',
  '#ffd93d', '#c77dff', '#ff8500', '#06d6a0',
  '#e64980', '#20c997', '#4c6ef5', '#fab005',
];

function detectMessageType(text: string, mediaFilename?: string): MessageType {
  if (!text && !mediaFilename) return 'text';
  if (mediaFilename) {
    const ext = mediaFilename.split('.').pop()?.toLowerCase() ?? '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(ext)) return 'image';
    if (['mp4', 'mov', 'avi', 'mkv', '3gp'].includes(ext)) return 'video';
    if (['mp3', 'ogg', 'opus', 'm4a', 'aac', 'wav'].includes(ext)) return 'audio';
    return 'document';
  }
  const lower = text.toLowerCase();
  if (lower === 'this message was deleted' || lower === 'you deleted this message') return 'deleted';
  if (lower.includes('location:') || lower.startsWith('https://maps.google.com') || lower.startsWith('https://maps.apple.com')) return 'location';
  return 'text';
}

function isSystemMessage(sender: string, message: string): boolean {
  if (sender === '' || sender === 'System') return true;
  // WhatsApp system messages have no sender colon separation
  // Check for common system message patterns
  const sysPatterns = [
    'messages and calls are end-to-end encrypted',
    'created group',
    'added you',
    'changed the group',
    'changed this group',
    'left',
    'removed',
    'changed the subject',
    'changed the group description',
    'turned on disappearing messages',
    'turned off disappearing messages',
    'security code changed',
    'you\'re now an admin',
  ];
  const combined = `${sender} ${message}`.toLowerCase();
  return sysPatterns.some(p => combined.includes(p));
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

  // Support multiple WhatsApp export formats:
  // Android:  DD/MM/YYYY, HH:MM - Sender: Message
  // Android:  M/D/YY, H:MM AM - Sender: Message
  // iOS:      [DD/MM/YYYY, HH:MM:SS] Sender: Message
  // iOS:      [DD/MM/YYYY, HH:MM:SS AM] Sender: Message
  // Also handle narrow no-break space (\u202f) between time and AM/PM
  
  // Broad regex that catches most formats
  const androidRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s|\u202f)?(?:AM|PM|am|pm|a\.m\.|p\.m\.)?)\s*[-–]\s*(.*)/;
  const iosRegex = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s|\u202f)?(?:AM|PM|am|pm|a\.m\.|p\.m\.)?)\]\s*(.*)/;
  // Also handle DD.MM.YYYY and DD-MM-YYYY separators
  const altDateRegex = /^(\d{1,2}[.\-]\d{1,2}[.\-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s|\u202f)?(?:AM|PM|am|pm)?)\s*[-–]\s*(.*)/;

  // FIRST PASS: Detect Date Format Globally
  let detectedFormat: 'DD/MM' | 'MM/DD' | 'ambiguous' = 'ambiguous';
  for (const line of lines) {
    if (line.length < 5 || (!line.includes('/') && !line.includes('.') && !line.includes('-'))) continue;
    const trimmed = line.replace(/^\u200e|\u200f|\ufeff/g, '');
    const match = trimmed.match(androidRegex) || trimmed.match(iosRegex) || trimmed.match(altDateRegex);
    if (match) {
      const parts = match[1].replace(/[.\-]/g, '/').split('/');
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);
      
      if (p0 > 12) {
        detectedFormat = 'DD/MM';
        break; // Globally proven!
      } else if (p1 > 12) {
        detectedFormat = 'MM/DD';
        break; // Globally proven!
      }
    }
  }

  let current: RawParsedMessage | null = null;

  for (const line of lines) {
    const trimmed = line.replace(/^\u200e|\u200f|\ufeff/g, ''); // Strip BOM and LTR/RTL marks
    
    const match = trimmed.match(androidRegex) || trimmed.match(iosRegex) || trimmed.match(altDateRegex);

    if (match) {
      if (current) rawMessages.push(current);
      const [, datePart, timePart, rest] = match;

      let parsedDate: Date;
      try {
        // Normalize date separators
        const normalizedDate = datePart.replace(/[.\-]/g, '/');
        const parts = normalizedDate.split('/');
        let day: number, month: number, year: number;
        
        const p0 = parseInt(parts[0], 10);
        const p1 = parseInt(parts[1], 10);
        
        if (detectedFormat === 'DD/MM') {
          day = p0;
          month = p1 - 1;
        } else if (detectedFormat === 'MM/DD') {
          month = p0 - 1;
          day = p1;
        } else {
          // If strictly ambiguous, fallback to DD/MM (Global WhatsApp Default)
          day = p0;
          month = p1 - 1;
        }
        
        year = parseInt(parts[2]);
        if (year < 100) year += 2000;
        
        const timeCleaned = timePart.replace(/\u202f/g, ' ').trim();
        parsedDate = new Date(year, month, day);
        
        // Parse time
        const timeMatch = timeCleaned.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s?(AM|PM|am|pm|a\.m\.|p\.m\.))?/);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const seconds = parseInt(timeMatch[3] ?? '0');
          const meridiem = timeMatch[4]?.replace(/\./g, '').toUpperCase();
          if (meridiem === 'PM' && hours < 12) hours += 12;
          if (meridiem === 'AM' && hours === 12) hours = 0;
          parsedDate.setHours(hours, minutes, seconds);
        }
      } catch {
        parsedDate = new Date();
      }

      const colonIdx = rest.indexOf(': ');
      let sender = '';
      let message = rest;
      if (colonIdx !== -1) {
        sender = rest.substring(0, colonIdx).trim();
        message = rest.substring(colonIdx + 2).trim();
      }

      // Remove Unicode marks WhatsApp adds
      sender = sender.replace(/\u202a|\u202c|\u200e|\u200f/g, '').trim();
      message = message.replace(/\u200e|\u200f/g, '').trim();

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
    if (msg.author && !isSystemMessage(msg.author, msg.message)) {
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
  // WhatsApp attaches media like:
  //   IMG-20230101-WA0001.jpg (file attached)
  //   <attached: IMG-20230101-WA0001.jpg>
  //   image omitted
  const mediaAttachedRegex = /^(.+?)\s*\(file attached\)$|^<attached:\s*(.+?)>$/i;
  const mediaOmittedRegex = /^[\u200e]?(image|video|audio|document|sticker|GIF) omitted$/i;

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
      text = `${omittedMatch[1]} omitted`;
    }

    const isSys = isSystemMessage(raw.author, raw.message);
    const type = isSys
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
      isOwn: false,
    };
  });

  return { messages, participants };
}

export function applyOwner(messages: ParsedMessage[], ownerName: string): ParsedMessage[] {
  return messages.map((m) => ({ ...m, isOwn: m.sender === ownerName }));
}
