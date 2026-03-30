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
      <div className="flex-shrink-0 hidden lg:flex flex-col overflow-hidden"
        style={{ width: 300 }}>
        <Sidebar />
      </div>

      {/* Main chat panel */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <ChatHeader onNewChat={onNewChat} />
        <MessageList />

        {/* Input bar (read only) */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
          style={{ background: 'var(--wa-bg-input)', borderTop: '1px solid var(--wa-border)' }}
        >
          {/* Emoji icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--wa-text-muted)" strokeWidth="1.5" className="flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
          <div className="flex-1 rounded-lg px-4 py-2.5 text-sm"
            style={{ background: 'var(--wa-bg-hover)', color: 'var(--wa-text-muted)' }}>
            Read-only view — this is an exported chat
          </div>
          {/* Mic icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--wa-text-muted)" strokeWidth="1.5" className="flex-shrink-0">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </div>
      </div>

      {/* Owner selection modal */}
      {!ownerName && <OwnerModal />}
    </div>
  );
}
