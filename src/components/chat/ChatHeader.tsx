'use client';

import { useChatStore } from '@/store/chatStore';
import { useState, useEffect, useMemo, useCallback } from 'react';

interface ChatHeaderProps {
  onNewChat: () => void;
}

export default function ChatHeader({ onNewChat }: ChatHeaderProps) {
  const {
    title, participants, ownerName, searchQuery, setSearchQuery,
    setShowOwnerModal, theme, toggleTheme,
    searchMatchIds, searchMatchIndex, setSearchMatchIndex,
  } = useChatStore();
  const [searchOpen, setSearchOpen] = useState(false);

  const others = participants.filter((p) => p.name !== ownerName);
  const topParticipant = others[0];

  const participantNames = participants.map((p) => {
    if (p.name === ownerName) return 'You';
    return p.name;
  }).join(', ');

  const matchCount = searchMatchIds.length;

  const prevMatch = useCallback(() => {
    if (matchCount === 0) return;
    setSearchMatchIndex((searchMatchIndex - 1 + matchCount) % matchCount);
  }, [matchCount, searchMatchIndex, setSearchMatchIndex]);

  const nextMatch = useCallback(() => {
    if (matchCount === 0) return;
    setSearchMatchIndex((searchMatchIndex + 1) % matchCount);
  }, [matchCount, searchMatchIndex, setSearchMatchIndex]);

  // Keyboard shortcuts for search nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!searchOpen) return;
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); nextMatch(); }
      if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); prevMatch(); }
      if (e.key === 'Escape') { setSearchQuery(''); setSearchOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen, nextMatch, prevMatch, setSearchQuery]);

  return (
    <div className="flex items-center gap-3 px-5 py-3 z-10 flex-shrink-0"
      style={{ background: 'var(--wa-bg-header)', borderBottom: '1px solid var(--wa-border)' }}>
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold cursor-pointer transition-transform hover:scale-105"
        style={{ background: topParticipant?.color ?? 'var(--wa-accent)', color: '#fff' }}
        onClick={() => setShowOwnerModal(true)}
        title="Change participant identity"
      >
        {(title || 'C').charAt(0).toUpperCase()}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-[15px] truncate" style={{ color: 'var(--wa-text-primary)' }}>
          {title}
        </h2>
        <p className="text-xs truncate" style={{ color: 'var(--wa-text-secondary)' }}>
          {participantNames}
        </p>
      </div>

      {/* Search */}
      {searchOpen ? (
        <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all"
          style={{ background: 'var(--wa-bg-search)', minWidth: 260 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--wa-text-secondary)" strokeWidth="2.5" className="flex-shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1 min-w-0"
            style={{ color: 'var(--wa-text-primary)' }}
            autoFocus
          />
          {searchQuery && (
            <span className="text-[11px] whitespace-nowrap flex-shrink-0" style={{ color: 'var(--wa-text-muted)' }}>
              {matchCount > 0 ? `${searchMatchIndex + 1}/${matchCount}` : '0 results'}
            </span>
          )}
          {matchCount > 1 && (
            <>
              <button onClick={prevMatch} className="hover:opacity-70 flex-shrink-0" title="Previous match (Shift+Enter)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--wa-text-secondary)" strokeWidth="2.5">
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
              </button>
              <button onClick={nextMatch} className="hover:opacity-70 flex-shrink-0" title="Next match (Enter)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--wa-text-secondary)" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            </>
          )}
          <button onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
            className="hover:opacity-70 transition-opacity flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--wa-text-secondary)" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      ) : (
        <button onClick={() => setSearchOpen(true)}
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
          style={{ background: 'var(--wa-bg-search)' }}
          title="Search messages (Ctrl+F)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--wa-text-secondary)" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      )}

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="theme-toggle w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
        style={{ background: 'var(--wa-bg-search)' }}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--wa-text-secondary)" strokeWidth="2">
            <circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--wa-text-secondary)" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
        )}
      </button>

      {/* New chat */}
      <button
        onClick={onNewChat}
        className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
        style={{ background: 'var(--wa-bg-search)' }}
        title="Load a different chat"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--wa-text-secondary)" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
      </button>
    </div>
  );
}
