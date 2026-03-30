'use client';

import { useChatStore } from '@/store/chatStore';

interface ChatHeaderProps {
  onNewChat: () => void;
}

export default function ChatHeader({ onNewChat }: ChatHeaderProps) {
  const { title, participants, ownerName, searchQuery, setSearchQuery, setShowOwnerModal } = useChatStore();

  const others = participants.filter((p) => p.name !== ownerName);
  const topParticipant = others[0];
  const totalMessages = participants.reduce((sum, p) => sum + p.messageCount, 0);

  return (
    <div className="flex items-center gap-3 px-4 py-2 z-10 flex-shrink-0"
      style={{ background: 'var(--wa-bg-header)', borderBottom: '1px solid var(--wa-border)', minHeight: 60 }}>
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-base font-bold cursor-pointer"
        style={{ background: topParticipant?.color ?? 'var(--wa-accent)', color: '#fff' }}
        onClick={() => setShowOwnerModal(true)}
        title="Change your identity"
      >
        {(title || 'C').charAt(0).toUpperCase()}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-sm truncate" style={{ color: 'var(--wa-text-primary)' }}>
          {title}
        </h2>
        <p className="text-xs truncate" style={{ color: 'var(--wa-text-secondary)' }}>
          {participants.length > 0
            ? participants.map((p) => p.name).join(', ')
            : 'Loading participants...'}
          {totalMessages > 0 && (
            <span className="ml-2" style={{ color: 'var(--wa-text-muted)' }}>
              · {totalMessages.toLocaleString()} messages
            </span>
          )}
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-full px-3 py-1.5"
        style={{ background: 'var(--wa-bg-search)', minWidth: 180 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--wa-text-secondary)" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent outline-none text-sm flex-1"
          style={{ color: 'var(--wa-text-primary)' }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--wa-text-secondary)" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* New chat button */}
      <button
        onClick={onNewChat}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
        style={{ background: 'var(--wa-bg-hover)', color: 'var(--wa-text-secondary)' }}
        title="Load a different chat"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        New
      </button>
    </div>
  );
}
