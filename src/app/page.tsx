'use client';

import { useChatStore } from '@/store/chatStore';
import FileDropzone from '@/components/upload/FileDropzone';
import LoadingOverlay from '@/components/upload/LoadingOverlay';
import ChatLayout from '@/components/chat/ChatLayout';

export default function Home() {
  const { sessionId, isLoading, clearSession } = useChatStore();

  const hasSession = !!sessionId;

  return (
    <main style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <LoadingOverlay />

      {!hasSession ? (
        /* Upload screen */
        <div
          className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto"
          style={{ background: 'var(--wa-bg-app)' }}
        >
          <FileDropzone />
        </div>
      ) : (
        /* Chat viewer */
        <div className="flex-1 overflow-hidden">
          <ChatLayout onNewChat={clearSession} />
        </div>
      )}
    </main>
  );
}
