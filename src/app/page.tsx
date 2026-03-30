'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import FileDropzone from '@/components/upload/FileDropzone';
import LoadingOverlay from '@/components/upload/LoadingOverlay';
import ChatLayout from '@/components/chat/ChatLayout';
import { saveSession, loadSession, listSessions, deleteSession } from '@/lib/db/dexie';
import ThemeProvider from '@/components/ThemeProvider';

export default function Home() {
  const {
    sessionId, isLoading, clearSession, setSession, setOwnerName,
    ownerName, messages, participants, blobStore, title,
    theme, setTheme, hasSavedSession, setHasSavedSession, setLoading,
  } = useChatStore();

  const [savedSessions, setSavedSessions] = useState<Array<{
    id: string;
    title: string;
    ownerName: string | null;
    startDate: number;
    endDate: number;
    createdAt: number;
  }>>([]);
  const [showSaved, setShowSaved] = useState(false);

  const hasSession = !!sessionId;

  // Check for saved sessions on mount
  useEffect(() => {
    listSessions().then((sessions) => {
      setSavedSessions(sessions);
      setHasSavedSession(sessions.length > 0);
    }).catch(() => {});
  }, [setHasSavedSession, sessionId]);

  // Auto-save session after owner is set
  useEffect(() => {
    if (sessionId && ownerName && messages.length > 0) {
      saveSession(sessionId, title, ownerName, messages, participants, blobStore)
        .then(() => {
          setHasSavedSession(true);
          // Refresh session list
          listSessions().then(setSavedSessions).catch(() => {});
        })
        .catch((err) => console.warn('Failed to save session:', err));
    }
  }, [sessionId, ownerName, messages, title, participants, blobStore, setHasSavedSession]);

  const handleLoadSaved = async (id: string) => {
    try {
      setLoading(true, 'Restoring session...', 50);
      const result = await loadSession(id);
      if (!result) {
        setLoading(false);
        return;
      }
      setSession({
        sessionId: id,
        title: result.session.title,
        messages: result.messages,
        participants: result.participants,
        blobStore: result.blobStore,
        ownerName: result.session.ownerName,
      });
      if (result.session.ownerName) {
        // Re-apply owner after setting session
        setTimeout(() => setOwnerName(result.session.ownerName!), 0);
      }
      setShowSaved(false);
    } catch (err) {
      console.error('Failed to load session:', err);
      setLoading(false);
    }
  };

  const handleDeleteSaved = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSession(id);
    const updated = await listSessions();
    setSavedSessions(updated);
    setHasSavedSession(updated.length > 0);
  };

  const handleNewChat = () => {
    clearSession();
    setShowSaved(false);
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

          {/* Saved sessions */}
          {savedSessions.length > 0 && (
            <div className="w-full max-w-xl mt-6">
              <button
                onClick={() => setShowSaved(!showSaved)}
                className="w-full flex items-center justify-between px-5 py-3 rounded-xl transition-all"
                style={{ background: 'var(--wa-bg-received)', border: '1px solid var(--wa-border)' }}
              >
                <div className="flex items-center gap-2.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--wa-accent)" strokeWidth="2">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-sm font-medium" style={{ color: 'var(--wa-text-primary)' }}>
                    Recent Chats ({savedSessions.length})
                  </span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--wa-text-secondary)" strokeWidth="2.5"
                  style={{ transform: showSaved ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {showSaved && (
                <div className="mt-2 flex flex-col gap-1.5 rounded-xl overflow-hidden"
                  style={{ background: 'var(--wa-bg-received)', border: '1px solid var(--wa-border)' }}>
                  {savedSessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleLoadSaved(s.id)}
                      className="flex items-center gap-3 px-4 py-3 text-left transition-colors hover:opacity-80"
                      style={{ borderBottom: '1px solid var(--wa-border)' }}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                        style={{ background: 'var(--wa-accent)', color: '#fff' }}>
                        {s.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--wa-text-primary)' }}>
                          {s.title}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--wa-text-secondary)' }}>
                          {new Date(s.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' – '}
                          {new Date(s.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSaved(s.id, e)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-60 flex-shrink-0"
                        style={{ color: 'var(--wa-text-muted)' }}
                        title="Delete saved chat"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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
