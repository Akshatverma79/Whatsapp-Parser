'use client';

import { useState, useRef, useCallback, memo } from 'react';
import { ParsedMessage } from '@/types';
import { useChatStore } from '@/store/chatStore';
import AudioBubble from '@/components/media/AudioBubble';
import MediaLightbox from '@/components/media/MediaLightbox';

interface MessageBubbleProps {
  message: ParsedMessage;
  showSenderName: boolean;
  senderColor: string;
  searchQuery: string;
  isActiveSearchMatch?: boolean;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  try {
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="search-highlight">{part}</mark>
      ) : (
        part
      )
    );
  } catch {
    return text;
  }
}

function Tick({ isOwn }: { isOwn: boolean }) {
  if (!isOwn) return null;
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" className="flex-shrink-0" style={{ color: 'var(--wa-tick-double)' }}>
      <path d="M11.071 0.653l-5.657 7.071-1.414-1.414" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.243 0.653l-5.657 7.071-0.354-0.354" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function DocExt(filename: string) {
  return filename.split('.').pop()?.toUpperCase().slice(0, 4) ?? 'FILE';
}

function MessageBubbleInner({
  message, showSenderName, senderColor, searchQuery, isActiveSearchMatch
}: MessageBubbleProps) {
  const { resolveBlobUrl } = useChatStore();
  const [lightbox, setLightbox] = useState<{ src: string; type: 'image' | 'video' } | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  const blobUrl = message.mediaFilename ? resolveBlobUrl(message.mediaFilename) : undefined;
  const isOwn = message.isOwn ?? false;

  const openLightbox = useCallback((src: string, type: 'image' | 'video') => {
    setLightbox({ src, type });
  }, []);

  // System message
  if (message.type === 'system') {
    return (
      <div className="system-message">
        <span>{message.text}</span>
      </div>
    );
  }

  const bubbleClass = isOwn ? 'bubble bubble-sent' : 'bubble bubble-received';
  const isMedia = ['image', 'video', 'audio', 'document'].includes(message.type);

  const matchStyle = isActiveSearchMatch
    ? { outline: '2px solid var(--wa-accent)', outlineOffset: '2px', borderRadius: 'var(--wa-radius-bubble)' }
    : undefined;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      style={{ padding: '1px 16px' }}>
      {lightbox && (
        <MediaLightbox src={lightbox.src} type={lightbox.type} onClose={() => setLightbox(null)} />
      )}
      <div className={`${bubbleClass} ${isMedia ? 'media-bubble' : ''}`} style={matchStyle}>
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

        {/* Deleted message */}
        {message.type === 'deleted' && (
          <div className="deleted-text">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
            This message was deleted
          </div>
        )}

        {/* Image */}
        {message.type === 'image' && blobUrl && (
          <div>
            {!imgLoaded && <div className="shimmer" style={{ width: 280, height: 200, borderRadius: 6 }} />}
            <img
              src={blobUrl}
              alt="Shared image"
              className="media-image"
              style={{ display: imgLoaded ? 'block' : 'none' }}
              onLoad={() => setImgLoaded(true)}
              onClick={() => openLightbox(blobUrl, 'image')}
            />
            {message.text && (
              <p className="bubble-text" style={{ padding: '4px 6px 0' }}>{highlightText(message.text, searchQuery)}</p>
            )}
          </div>
        )}

        {message.type === 'image' && !blobUrl && (
          <div className="media-placeholder">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>{message.text || 'Image not available'}</span>
          </div>
        )}

        {/* Video */}
        {message.type === 'video' && blobUrl && (
          <div className="relative">
            <video
              src={blobUrl}
              className="media-video"
              onClick={() => openLightbox(blobUrl, 'video')}
              preload="metadata"
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.5)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
        )}

        {message.type === 'video' && !blobUrl && (
          <div className="media-placeholder">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
            <span>{message.text || 'Video not available'}</span>
          </div>
        )}

        {/* Audio */}
        {message.type === 'audio' && blobUrl && <AudioBubble src={blobUrl} />}
        {message.type === 'audio' && !blobUrl && (
          <div className="media-placeholder" style={{ width: 220, height: 60 }}>
            <span>{message.text || 'Audio not available'}</span>
          </div>
        )}

        {/* Document */}
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
          <span className="bubble-text">{highlightText(message.text, searchQuery)}</span>
        )}

        {/* Meta: time + tick */}
        <span className="bubble-meta">
          <span>{formatTime(message.date)}</span>
          <Tick isOwn={isOwn} />
        </span>
      </div>
    </div>
  );
}

const MessageBubble = memo(MessageBubbleInner);
export default MessageBubble;
