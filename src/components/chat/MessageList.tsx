'use client';

import { useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useChatStore } from '@/store/chatStore';
import { ParsedMessage } from '@/types';
import MessageBubble from './MessageBubble';
import DateSeparator from './DateSeparator';

type ListItem =
  | { kind: 'date'; key: string; date: Date }
  | { kind: 'message'; key: string; message: ParsedMessage };

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function MessageList() {
  const { messages, participants, searchQuery } = useChatStore();

  // Map participant name → color
  const colorMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of participants) m[p.name] = p.color;
    return m;
  }, [participants]);

  // Filter by search query
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(
      (m) =>
        m.text.toLowerCase().includes(q) ||
        m.sender.toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  // Build flat list with date separators injected
  const items: ListItem[] = useMemo(() => {
    const result: ListItem[] = [];
    let lastDate: Date | null = null;
    for (const msg of filtered) {
      if (!lastDate || !isSameDay(lastDate, msg.date)) {
        result.push({ kind: 'date', key: `date-${msg.date.toDateString()}`, date: msg.date });
        lastDate = msg.date;
      }
      result.push({ kind: 'message', key: msg.id, message: msg });
    }
    return result;
  }, [filtered]);

  // Determine if group chat (>2 participants visible)
  const isGroup = participants.length > 2;

  if (filtered.length === 0 && searchQuery) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3"
        style={{ color: 'var(--wa-text-secondary)' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <p className="text-sm">No messages match &quot;{searchQuery}&quot;</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden chat-bg">
      <Virtuoso
        className="chat-scroll"
        style={{ height: '100%' }}
        data={items}
        followOutput="smooth"
        initialTopMostItemIndex={items.length - 1}
        itemContent={(_, item) => {
          if (item.kind === 'date') {
            return <DateSeparator key={item.key} date={item.date} />;
          }
          const msg = item.message;
          return (
            <MessageBubble
              key={item.key}
              message={msg}
              showSenderName={isGroup && msg.type !== 'system'}
              senderColor={colorMap[msg.sender] ?? 'var(--wa-accent)'}
              searchQuery={searchQuery}
            />
          );
        }}
      />
    </div>
  );
}
