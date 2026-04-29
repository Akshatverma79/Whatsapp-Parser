'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { extractZip } from '@/lib/extractZip';
import { parseWhatsAppChat } from '@/lib/parse/chatParser';

const ACCEPTED = ['.zip', '.txt'];

function AnimatedBackground() {
  return (
    <div className="animated-bg-container">
      {/* Gradient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      {/* Grid overlay */}
      <div className="grid-overlay" />
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className={`feature-card ${visible ? 'feature-card-visible' : ''}`}>
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{description}</p>
    </div>
  );
}

function StatBadge({ icon, label, value, delay }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className={`stat-badge ${visible ? 'stat-badge-visible' : ''}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function FileDropzone() {
  const { setLoading, setSession } = useChatStore();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

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
    <div className="dashboard-root">
      <AnimatedBackground />

      <div className="dashboard-content">
        {/* ───── Hero Section ───── */}
        <div className={`hero-section ${mounted ? 'hero-visible' : ''}`}>
          {/* Animated logo */}
          <div className="hero-logo-wrap">
            <div className="hero-logo-glow" />
            <div className="hero-logo-ring" />
            <div className="hero-logo">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
          </div>

          <h1 className="hero-title">
            WhatsApp Chat <span className="hero-title-accent">Viewer</span>
          </h1>
          <p className="hero-subtitle">
            Relive your conversations in a beautiful, pixel-perfect WhatsApp-style interface
          </p>

          {/* Trust badges */}
          <div className="trust-badges">
            <div className="trust-badge trust-badge-green">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/>
              </svg>
              100% Private
            </div>
            <div className="trust-badge trust-badge-blue">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
              </svg>
              No Server Upload
            </div>
            <div className="trust-badge trust-badge-purple">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
              Fully Secure
            </div>
          </div>
        </div>

        {/* ───── Upload Card (glassmorphism) ───── */}
        <div className={`upload-card-wrapper ${mounted ? 'upload-card-visible' : ''}`}>
          <label
            htmlFor="file-input"
            className={`upload-card ${isDragging ? 'upload-card-active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
          >
            {/* Pulse ring when dragging */}
            {isDragging && <div className="upload-pulse-ring" />}

            <div className={`upload-icon-box ${isDragging ? 'upload-icon-active' : ''}`}>
              {isDragging ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              )}
            </div>

            <div className="upload-text">
              <p className="upload-title">
                {isDragging ? 'Drop your file here!' : 'Drop your WhatsApp export here'}
              </p>
              <p className="upload-subtitle">
                or <span className="upload-browse">click to browse</span> files
              </p>
            </div>

            <div className="file-type-pills">
              <div className="file-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
                  <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>
                </svg>
                .zip
                <span className="pill-sub">(with media)</span>
              </div>
              <div className="file-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
                .txt
                <span className="pill-sub">(text only)</span>
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
        </div>

        {/* ───── Error Banner ───── */}
        {error && (
          <div className="error-banner animate-shake">
            <div className="error-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="error-text">{error}</p>
            <button className="error-dismiss" onClick={() => setError(null)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}

        {/* ───── Feature Grid ───── */}
        <div className="features-grid">
          <FeatureCard
            delay={400}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            }
            title="Privacy First"
            description="Everything is processed locally in your browser. No data leaves your device."
          />
          <FeatureCard
            delay={550}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            }
            title="Full Media Support"
            description="View images, videos, voice notes, and documents exactly as they appeared."
          />
          <FeatureCard
            delay={700}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            }
            title="Smart Search"
            description="Instantly find any message with powerful full-text search and navigation."
          />
        </div>

        {/* ───── Stats Row ───── */}
        <div className="stats-row">
          <StatBadge
            delay={800}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            }
            label="Instant"
            value="Fast"
          />
          <StatBadge
            delay={900}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            }
            label="Encryption"
            value="Zero-Upload"
          />
          <StatBadge
            delay={1000}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
              </svg>
            }
            label="Themes"
            value="Dark + Light"
          />
        </div>

        {/* ───── How-To Guide Card ───── */}
        <div className={`howto-card ${mounted ? 'howto-visible' : ''}`}>
          <div className="howto-header">
            <div className="howto-header-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <span className="howto-header-text">How to export your chat</span>
          </div>
          <div className="howto-steps">
            {[
              { step: '1', text: 'Open any chat in WhatsApp' },
              { step: '2', text: 'Tap ⋮ Menu → More → Export chat' },
              { step: '3', text: 'Select "Include media" for photos & videos' },
              { step: '4', text: 'Save the .zip and upload it here' },
            ].map((item, i) => (
              <div key={item.step} className="howto-step" style={{ animationDelay: `${1000 + i * 100}ms` }}>
                <div className="howto-step-num">{item.step}</div>
                <span className="howto-step-text">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ───── Footer ───── */}
        <div className={`dashboard-footer ${mounted ? 'footer-visible' : ''}`}>
          <p>Built with privacy in mind • No data ever leaves your browser</p>
        </div>
      </div>
    </div>
  );
}
