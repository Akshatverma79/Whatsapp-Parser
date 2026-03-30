'use client';

import { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { ChatParticipant } from '@/types';

export default function OwnerModal() {
  const { showOwnerModal, participants, setOwnerName } = useChatStore();
  const [selected, setSelected] = useState<string>('');

  if (!showOwnerModal) return null;

  const sorted = [...participants].sort((a, b) => b.messageCount - a.messageCount);

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--wa-accent-muted)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--wa-accent)" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--wa-text-primary)' }}>
              Which participant are you?
            </h2>
            <p className="text-xs" style={{ color: 'var(--wa-text-secondary)' }}>
              Your messages will appear on the right (green bubbles)
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-6 max-h-64 overflow-y-auto">
          {sorted.map((p: ChatParticipant) => (
            <button
              key={p.name}
              onClick={() => setSelected(p.name)}
              className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
              style={{
                background: selected === p.name ? 'var(--wa-accent-muted)' : 'var(--wa-bg-hover)',
                border: selected === p.name ? '1.5px solid var(--wa-accent)' : '1.5px solid transparent',
              }}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                style={{ background: p.color, color: '#fff' }}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: 'var(--wa-text-primary)' }}>
                  {p.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--wa-text-secondary)' }}>
                  {p.messageCount.toLocaleString()} messages
                </p>
              </div>
              {selected === p.name && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--wa-accent)">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              )}
            </button>
          ))}
        </div>

        <button
          disabled={!selected}
          onClick={() => selected && setOwnerName(selected)}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: selected ? 'var(--wa-accent)' : 'var(--wa-border)',
            color: selected ? '#fff' : 'var(--wa-text-muted)',
            cursor: selected ? 'pointer' : 'not-allowed',
          }}
        >
          {selected ? `Continue as ${selected}` : 'Select your name'}
        </button>
      </div>
    </div>
  );
}
