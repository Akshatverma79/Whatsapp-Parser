'use client';

import { useCallback, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { extractZip } from '@/lib/extractZip';
import { parseWhatsAppChat } from '@/lib/parse/chatParser';

const ACCEPTED = ['.zip', '.txt'];

export default function FileDropzone() {
  const { setLoading, setSession } = useChatStore();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      const isZip = file.name.endsWith('.zip');
      const isTxt = file.name.endsWith('.txt');

      if (!isZip && !isTxt) {
        setError('Please upload a .zip or .txt WhatsApp export file.');
        return;
      }

      try {
        let chatText = '';
        let blobStore: Record<string, string> = {};

        if (isZip) {
          setLoading(true, 'Extracting ZIP...', 0);
          const result = await extractZip(file, (pct) => {
            setLoading(true, 'Extracting media files...', pct);
          });
          chatText = result.chatText;
          blobStore = result.blobStore;
        } else {
          setLoading(true, 'Reading chat file...', 50);
          chatText = await file.text();
        }

        if (!chatText.trim()) {
          setError('Could not find a chat log in the file. Make sure it is a WhatsApp export.');
          setLoading(false);
          return;
        }

        setLoading(true, 'Parsing messages...', 90);

        // Small delay to let the UI update
        await new Promise((r) => setTimeout(r, 50));

        const { messages, participants } = parseWhatsAppChat(chatText);

        if (messages.length === 0) {
          setError('No messages could be parsed. Please check the file format.');
          setLoading(false);
          return;
        }

        const title = file.name.replace(/\.zip|\.txt$/i, '').replace(/_/g, ' ');
        const sessionId = `session-${Date.now()}`;

        setSession({ sessionId, title, messages, participants, blobStore, ownerName: null });
      } catch (err) {
        console.error(err);
        setError('An error occurred while processing the file. Please try again.');
        setLoading(false);
      }
    },
    [setLoading, setSession]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6">
      {/* Logo area */}
      <div className="flex flex-col items-center gap-3 mb-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #00a884, #25d366)' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--wa-text-primary)' }}>
          WhatsApp Chat Viewer
        </h1>
        <p style={{ color: 'var(--wa-text-secondary)' }} className="text-center max-w-sm text-sm">
          Upload your exported WhatsApp chat to view it in a beautiful, faithful interface.
          <br />
          <span style={{ color: 'var(--wa-accent)' }}>100% private</span> — all processing happens in your browser.
        </p>
      </div>

      {/* Drop zone */}
      <label
        htmlFor="file-input"
        className={`upload-area cursor-pointer flex flex-col items-center justify-center gap-4 p-10 w-full max-w-lg transition-all ${isDragging ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: 'var(--wa-accent-muted)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--wa-accent)" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-semibold text-base" style={{ color: 'var(--wa-text-primary)' }}>
            {isDragging ? 'Drop it here!' : 'Drag & drop your chat export'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--wa-text-secondary)' }}>
            or <span style={{ color: 'var(--wa-accent)' }} className="font-medium">browse files</span>
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--wa-text-muted)' }}>
            Supports .zip (with media) and .txt formats
          </p>
        </div>
        <input
          id="file-input"
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={onFileChange}
        />
      </label>

      {/* How to export guide */}
      <div className="w-full max-w-lg rounded-xl p-5" style={{ background: 'var(--wa-bg-received)' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--wa-text-secondary)' }}>
          HOW TO EXPORT A WHATSAPP CHAT
        </p>
        <ol className="text-sm space-y-1" style={{ color: 'var(--wa-text-secondary)' }}>
          <li>1. Open a chat in WhatsApp</li>
          <li>2. Tap the <strong style={{ color: 'var(--wa-text-primary)' }}>⋮ Menu</strong> → <strong style={{ color: 'var(--wa-text-primary)' }}>More</strong> → <strong style={{ color: 'var(--wa-text-primary)' }}>Export chat</strong></li>
          <li>3. Choose <strong style={{ color: 'var(--wa-accent)' }}>With media</strong> for images/videos or <strong style={{ color: 'var(--wa-text-primary)' }}>Without media</strong></li>
          <li>4. Save the .zip file and upload it here</li>
        </ol>
      </div>

      {error && (
        <div className="w-full max-w-lg rounded-xl p-4 flex items-center gap-3"
          style={{ background: '#3d1f1f', border: '1px solid #7d2b2b' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-sm" style={{ color: '#ff9b9b' }}>{error}</p>
        </div>
      )}
    </div>
  );
}
