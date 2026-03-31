'use client';

import { useCallback, useState, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { extractZip } from '@/lib/extractZip';
import { parseWhatsAppChat } from '@/lib/parse/chatParser';

const ACCEPTED = ['.zip', '.txt'];

export default function FileDropzone() {
  const { setLoading, setSession } = useChatStore();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      const isZip = file.name.toLowerCase().endsWith('.zip');
      const isTxt = file.name.toLowerCase().endsWith('.txt');

      if (!isZip && !isTxt) {
        setError('Please upload a .zip or .txt WhatsApp export file.');
        return;
      }

      try {
        let chatText = '';
        let blobStore: Record<string, string> = {};

        if (isZip) {
          setLoading(true, 'Opening ZIP archive...', 5);
          const result = await extractZip(file, (pct) => {
            setLoading(true, `Extracting files... ${pct}%`, Math.min(pct, 85));
          });
          chatText = result.chatText;
          blobStore = result.blobStore;
        } else {
          setLoading(true, 'Reading chat file...', 50);
          chatText = await file.text();
        }

        if (!chatText.trim()) {
          setError('Could not find a chat text file inside the archive. Make sure it\'s a WhatsApp export ZIP.');
          setLoading(false);
          return;
        }

        setLoading(true, 'Parsing messages...', 90);
        await new Promise((r) => setTimeout(r, 50));

        const { messages, participants } = parseWhatsAppChat(chatText);

        if (messages.length === 0) {
          setError('No messages could be parsed. The file may not be a valid WhatsApp export.');
          setLoading(false);
          return;
        }

        const title = file.name.replace(/\.zip|\.txt$/i, '').replace(/_/g, ' ').replace(/WhatsApp Chat with /i, '');
        const sessionId = `session-${Date.now()}`;

        setSession({ sessionId, title, messages, participants, blobStore, ownerName: null });
      } catch (err) {
        console.error('Processing error:', err);
        setError(`Error processing file: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
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
      // Reset input so the same file can be re-uploaded
      if (inputRef.current) inputRef.current.value = '';
    },
    [processFile]
  );

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full gap-8 py-12 px-4">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4 max-w-lg text-center">
        {/* Animated logo */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-2xl opacity-30"
            style={{ background: 'radial-gradient(circle, #25d366 0%, transparent 70%)' }} />
          <div className="relative w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(145deg, #00a884, #25d366)' }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--wa-text-primary)' }}>
            WhatsApp Chat Viewer
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--wa-text-secondary)' }}>
            Relive your conversations in a beautiful WhatsApp-style interface.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: '#00a88418', color: 'var(--wa-accent)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/>
              </svg>
              100% Private
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: '#34b7f118', color: '#34b7f1' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/>
              </svg>
              No Upload Required
            </div>
          </div>
        </div>
      </div>

      {/* Upload zone */}
      <label
        htmlFor="file-input"
        className={`upload-area group cursor-pointer flex flex-col items-center justify-center gap-5 w-full max-w-xl transition-all ${isDragging ? 'drag-over' : ''}`}
        style={{ padding: '48px 32px' }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <div className="w-18 h-18 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ background: 'var(--wa-accent-muted)', width: 72, height: 72 }}>
          {isDragging ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--wa-accent)" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
            </svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--wa-accent)" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          )}
        </div>

        <div className="text-center">
          <p className="font-semibold text-lg mb-1" style={{ color: 'var(--wa-text-primary)' }}>
            {isDragging ? 'Drop your file here!' : 'Drop your WhatsApp export'}
          </p>
          <p className="text-sm" style={{ color: 'var(--wa-text-secondary)' }}>
            or <span className="font-semibold" style={{ color: 'var(--wa-accent)' }}>click to browse</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: 'var(--wa-bg-hover)', color: 'var(--wa-text-secondary)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
              <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>
            </svg>
            .zip (with media)
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: 'var(--wa-bg-hover)', color: 'var(--wa-text-secondary)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            .txt (text only)
          </div>
        </div>

        <input
          ref={inputRef}
          id="file-input"
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={onFileChange}
        />
      </label>

      {/* Error */}
      {error && (
        <div className="w-full max-w-xl rounded-xl p-4 flex items-start gap-3"
          style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-sm" style={{ color: '#ff9b9b' }}>{error}</p>
        </div>
      )}

      {/* Security Notice */}
      <div className="w-full max-w-xl rounded-xl p-4 flex items-center gap-3"
        style={{ background: 'var(--wa-bg-received)', border: '1px solid var(--wa-border)' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--wa-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <p className="text-sm" style={{ color: 'var(--wa-text-primary)' }}>
          <strong style={{ color: 'var(--wa-accent)' }}>100% Secure & Private.</strong> Your files are processed entirely locally on your device and are never uploaded to any server.
        </p>
      </div>

      {/* How-to guide */}
      <div className="w-full max-w-xl rounded-2xl overflow-hidden" style={{ background: 'var(--wa-bg-received)', border: '1px solid var(--wa-border)' }}>
        <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--wa-border)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--wa-accent)">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--wa-text-secondary)' }}>
            How to export your chat
          </span>
        </div>
        <div className="px-5 py-4 space-y-3">
          {[
            { step: '1', text: 'Open any chat in WhatsApp' },
            { step: '2', text: 'Tap ⋮ Menu → More → Export chat' },
            { step: '3', text: 'Select "Include media" for photos & videos' },
            { step: '4', text: 'Save the .zip and upload it here' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background: 'var(--wa-accent-muted)', color: 'var(--wa-accent)' }}>
                {item.step}
              </div>
              <span className="text-sm" style={{ color: 'var(--wa-text-primary)' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
