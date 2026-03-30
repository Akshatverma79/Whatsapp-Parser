'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioBubbleProps {
  src: string;
}

const NUM_BARS = 40;

export default function AudioBubble({ src }: AudioBubbleProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-1
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };
    const onEnded = () => { setPlaying(false); setProgress(0); setCurrentTime(0); };
    const onLoadedMeta = () => setDuration(audio.duration);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMeta);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMeta);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
    setProgress(pct);
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Generate pseudo-random waveform heights (seeded by src length)
  const heights = Array.from({ length: NUM_BARS }, (_, i) => {
    const seed = (src.length + i * 7) % 100;
    return 20 + ((seed * 31 + i * 17) % 70);
  });

  const playedBars = Math.round(progress * NUM_BARS);

  return (
    <div className="audio-bubble">
      <audio ref={audioRef} src={src} preload="metadata" />

      <button className="audio-play-btn" onClick={togglePlay}>
        {playing ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1"/>
            <rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        {/* Waveform */}
        <div className="audio-waveform" onClick={seek}>
          {heights.map((h, i) => (
            <div
              key={i}
              className={`waveform-bar ${i < playedBars ? 'played' : ''}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        {/* Timestamps */}
        <p className="text-xs" style={{ color: 'var(--wa-text-muted)' }}>
          {fmt(playing ? currentTime : duration)}
        </p>
      </div>
    </div>
  );
}
