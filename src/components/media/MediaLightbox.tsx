'use client';

import { useEffect } from 'react';

interface LightboxProps {
  src: string;
  type: 'image' | 'video';
  onClose: () => void;
}

export default function MediaLightbox({ src, type, onClose }: LightboxProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="lightbox" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      {type === 'image' ? (
        <img src={src} alt="Media" onClick={(e) => e.stopPropagation()} />
      ) : (
        <video src={src} controls autoPlay onClick={(e) => e.stopPropagation()} />
      )}
    </div>
  );
}
