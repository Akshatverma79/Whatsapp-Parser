'use client';

import { useState, useRef, useCallback } from 'react';
import { ParsedMessage } from '@/types';
import { useChatStore } from '@/store/chatStore';
import AudioBubble from '@/components/media/AudioBubble';
import MediaLightbox from '@/components/media/MediaLightbox';

interface MessageBubbleProps {
  message: ParsedMessage;
  showSenderName: boolean;
  senderColor: string;
  searchQuery: string;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="search-highlight">{part}</mark>
    ) : (
      part
    )
  );
}

function Tick({ isOwn }: { isOwn: boolean }) {
  if (!isOwn) return null;
  return (
    <svg width="15" height="11" viewBox="0 0 15 11" fill="var(--wa-tick-double)">
      <path d="M14.5 0.5L5 10 0.5 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.5 0.5L5 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function DocExt(filename: string) {
  return filename.split('.').pop()?.toUpperCase().slice(0, 4) ?? 'FILE';
}

export default function MessageBubble({
  message, showSenderName, senderColor, searchQuery
}: MessageBubbleProps) {
  const { resolveBlobUrl } = useChatStore();
  const [lightbox, setLightbox] = useState<{ src: string; type: 'image' | 'video' } | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const blobUrl = message.mediaFilename ? resolveBlobUrl(message.mediaFilename) : undefined;
  const isOwn = message.isOwn ?? false;

  const openLightbox = useCallback((src: string, type: 'image' | 'video') => {
    setLightbox({ src, type });
  }, []);

  if (message.type === 'system') {
    return (
      <div className="system-message">
        <span>{message.text}</span>
      </div>
    );
  }

  const bubbleClass = isOwn ? 'bubble bubble-sent msg-animate-right' : 'bubble bubble-received msg-animate-left';
  const isMedia = ['image', 'video', 'audio', 'document'].includes(message.type);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-4 py-0.5`}>
      {lightbox && (
        <MediaLightbox src={lightbox.src} type={lightbox.type} onClose={() => setLightbox(null)} />
      )}
      <div className={`${bubbleClass} ${isMedia ? 'media-bubble' : ''}`} style={{ maxWidth: '65%' }}>
        {/* Sender name for group chats */}
        {showSenderName && !isOwn && (
          <p className="sender-name" style={{ color: senderColor }}>{message.sender}</p>
        )}

        {/* Forwarded label */}
        {message.isForwarded && (
          <div className="forwarded-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 8H10C6.69 8 4 10.69 4 14v4h2v-4c0-2.21 1.79-4 4-4h4v3l5-4-5-4v3z"/>
            </svg>
            Forwarded
          </div>
        )}

        {/* Message content */}
        {message.type === 'deleted' && (
          <div className="deleted-text">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
            {message.text}
          </div>
        )}

        {message.type === 'image' && blobUrl && (
          <div>
            {!imgLoaded && <div className="shimmer" style={{ width: 260, height: 180 }} />}
            <img
              ref={imgRef}
              src={blobUrl}
              alt="Image"
              className="media-image"
              style={{ display: imgLoaded ? 'block' : 'none' }}
              onLoad={() => setImgLoaded(true)}
              onClick={() => openLightbox(blobUrl, 'image')}
              loading="lazy"
            />
            {message.text && (
              <p className="bubble-text px-1 pt-1">{highlightText(message.text, searchQuery)}</p>
            )}
          </div>
        )}

        {message.type === 'image' && !blobUrl && (
          <div className="media-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Image not available</span>
          </div>
        )}

        {message.type === 'video' && blobUrl && (
          <video
            src={blobUrl}
            className="media-video"
            onClick={() => openLightbox(blobUrl, 'video')}
            preload="metadata"
            playsInline
          />
        )}

        {message.type === 'video' && !blobUrl && (
          <div className="media-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
            <span>Video not available</span>
          </div>
        )}

        {message.type === 'audio' && blobUrl && <AudioBubble src={blobUrl} />}
        {message.type === 'audio' && !blobUrl && (
          <div className="audio-bubble">
            <div style={{ color: 'var(--wa-text-muted)', fontSize: 13 }}>Audio not available</div>
          </div>
        )}

        {message.type === 'document' && (
          <div className="doc-bubble">
            <div className="doc-icon">{DocExt(message.mediaFilename ?? 'file')}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--wa-text-primary)' }}>
                {message.mediaFilename ?? 'Document'}
              </p>
              {blobUrl ? (
                <a href={blobUrl} download={message.mediaFilename} className="text-xs" style={{ color: 'var(--wa-accent)' }}>
                  Download
                </a>
              ) : (
                <span className="text-xs" style={{ color: 'var(--wa-text-muted)' }}>Not available</span>
              )}
            </div>
          </div>
        )}

        {/* Plain text */}
        {!['deleted', 'image', 'video', 'audio', 'document'].includes(message.type) && message.text && (
          <p className="bubble-text">{highlightText(message.text, searchQuery)}</p>
        )}

        {/* Meta: time + tick */}
        {message.type !== 'system' && (
          <div className="bubble-meta">
            <span>{formatTime(message.date)}</span>
            <Tick isOwn={isOwn} />
          </div>
        )}
      </div>
    </div>
  );
}
