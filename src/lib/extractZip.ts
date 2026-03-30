import { BlobStore } from '@/types';

/**
 * Extracts a ZIP file and returns:
 * - chatText: contents of _chat.txt
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

  for (const entry of entries) {
    if (entry.directory) {
      processed++;
      continue;
    }

    const filename = entry.filename.split('/').pop() ?? entry.filename;

    if (filename === '_chat.txt' || filename.endsWith('chat.txt')) {
      // Extract chat text
      const writer = new TextWriter('utf-8');
      chatText = await entry.getData!(writer);
    } else {
      // Extract media as Blob URL
      const ext = filename.split('.').pop()?.toLowerCase() ?? '';
      const mimeMap: Record<string, string> = {
        jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
        gif: 'image/gif', webp: 'image/webp', heic: 'image/heic',
        mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo',
        '3gp': 'video/3gpp',
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
      const writer = new BlobWriter(mime);
      const blob = await entry.getData!(writer);
      blobStore[filename] = URL.createObjectURL(blob);
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
