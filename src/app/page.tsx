'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import FileDropzone from '@/components/upload/FileDropzone';
import LoadingOverlay from '@/components/upload/LoadingOverlay';
import ChatLayout from '@/components/chat/ChatLayout';
import ThemeProvider from '@/components/ThemeProvider';

export default function Home() {
  const {
    sessionId, isLoading, clearSession, setSession, setOwnerName,
    ownerName, messages, participants, blobStore, title,
    theme, setTheme, hasSavedSession, setHasSavedSession, setLoading,
  } = useChatStore();

  const hasSession = !!sessionId;

  const handleNewChat = () => {
    clearSession();
  };

  return (
    <ThemeProvider>
    <main style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <LoadingOverlay />

      {!hasSession ? (
        /* Upload screen */
        <div
          className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto"
          style={{ background: 'var(--wa-bg-app)' }}
        >
          <FileDropzone />



          {/* Theme toggle on upload page */}
          <button
            onClick={() => {
              const next = theme === 'dark' ? 'light' : 'dark';
              setTheme(next);
            }}
            className="fixed bottom-5 right-5 w-11 h-11 rounded-full flex items-center justify-center theme-toggle"
            style={{ background: 'var(--wa-bg-received)', border: '1px solid var(--wa-border)', boxShadow: 'var(--wa-shadow)' }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--wa-text-secondary)" strokeWidth="2">
                <circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--wa-text-secondary)" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      ) : (
        /* Chat viewer */
        <div className="flex-1 overflow-hidden">
          <ChatLayout onNewChat={handleNewChat} />
        </div>
      )}
    </main>
    </ThemeProvider>
  );
}
