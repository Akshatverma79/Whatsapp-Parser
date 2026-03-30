'use client';

import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import Sidebar from './Sidebar';
import OwnerModal from './OwnerModal';
import { useChatStore } from '@/store/chatStore';

interface ChatLayoutProps {
  onNewChat: () => void;
}

export default function ChatLayout({ onNewChat }: ChatLayoutProps) {
  const { ownerName } = useChatStore();

  return (
    <div className="flex w-full h-full overflow-hidden" style={{ background: 'var(--wa-bg-app)' }}>
      {/* Sidebar — chat info + participants */}
      <div className="w-72 flex-shrink-0 hidden md:flex flex-col overflow-hidden">
        <Sidebar />
      </div>

      {/* Main chat panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader onNewChat={onNewChat} />
        <MessageList />

        {/* Fake input bar (read only) */}
        <div
          className="flex items-center gap-3 px-4 py-2 flex-shrink-0"
          style={{ background: 'var(--wa-bg-input)', minHeight: 56 }}
        >
          <div className="flex-1 rounded-full px-4 py-2 text-sm flex items-center gap-2"
            style={{ background: 'var(--wa-bg-hover)', color: 'var(--wa-text-muted)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"/>
            </svg>
            This is a read-only view
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--wa-accent)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.41 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Owner selection modal */}
      {!ownerName && <OwnerModal />}
    </div>
  );
}
