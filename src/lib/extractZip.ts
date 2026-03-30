import { BlobStore } from '@/types';

/**
 * Extracts a ZIP file and returns:
 * - chatText: contents of the chat .txt file
 * - blobStore: map of filename → ObjectURL for media files
 */
export async function extractZip(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ chatText: string; blobStore: BlobStore }> {
  const { ZipReader, BlobReader, TextWriter, BlobWriter } = await import('@zip.js/zip.js');

  const reader = new ZipReader(new BlobReader(file));
  const entries = await reader.getEntries();

  const blobStore: BlobStore = {};
  let chatText = '';
  let processed = 0;
  const total = entries.length;

  // First pass: find the chat text file (could be named many things)
  const chatTxtPatterns = [
    '_chat.txt',
    'chat.txt',
    'whatsapp chat',
    '_chat',
  ];

  const isChatTxt = (name: string): boolean => {
    const lower = name.toLowerCase();
    if (lower.endsWith('.txt')) {
      for (const pat of chatTxtPatterns) {
        if (lower.includes(pat)) return true;
      }
      // Also match any .txt file if there's only one
      return true;
    }
    return false;
  };

  // Find all .txt files to determine the chat file
  const txtEntries = entries.filter(e => !e.directory && isChatTxt(e.filename.split('/').pop() ?? e.filename));
  // Prefer _chat.txt specifically, fallback to any .txt
  const chatEntry = txtEntries.find(e => {
    const fn = (e.filename.split('/').pop() ?? '').toLowerCase();
    return fn === '_chat.txt' || fn.includes('_chat');
  }) ?? txtEntries[0];

  for (const entry of entries) {
    if (entry.directory) {
      processed++;
      onProgress?.(Math.round((processed / total) * 100));
      continue;
    }

    const filename = entry.filename.split('/').pop() ?? entry.filename;

    if (chatEntry && entry.filename === chatEntry.filename) {
      // Extract chat text
      try {
        const writer = new TextWriter('utf-8');
        chatText = await entry.getData!(writer);
      } catch (e) {
        // Try without encoding specification
        const writer = new TextWriter();
        chatText = await entry.getData!(writer);
      }
    } else if (!filename.toLowerCase().endsWith('.txt')) {
      // Extract media as Blob URL
      const ext = filename.split('.').pop()?.toLowerCase() ?? '';
      const mimeMap: Record<string, string> = {
        jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
        gif: 'image/gif', webp: 'image/webp', heic: 'image/heic',
        mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo',
        '3gp': 'video/3gpp', mkv: 'video/x-matroska',
        mp3: 'audio/mpeg', ogg: 'audio/ogg', opus: 'audio/opus',
        m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav',
        pdf: 'application/pdf', doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        zip: 'application/zip',
      };
      const mime = mimeMap[ext] ?? 'application/octet-stream';
      try {
        const writer = new BlobWriter(mime);
        const blob = await entry.getData!(writer);
        blobStore[filename] = URL.createObjectURL(blob);
      } catch (e) {
        console.warn(`Failed to extract media: ${filename}`, e);
      }
    }

    processed++;
    onProgress?.(Math.round((processed / total) * 100));
  }

  await reader.close();
  return { chatText, blobStore };
}

/**
 * Revokes all object URLs to free memory
 */
export function revokeBlobStore(blobStore: BlobStore): void {
  for (const url of Object.values(blobStore)) {
    URL.revokeObjectURL(url);
  }
}
