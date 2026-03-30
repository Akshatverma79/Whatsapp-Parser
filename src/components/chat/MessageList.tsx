'use client';

import { useMemo, useEffect, useRef } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useChatStore } from '@/store/chatStore';
import { ParsedMessage } from '@/types';
import MessageBubble from './MessageBubble';
import DateSeparator from './DateSeparator';

type ListItem =
  | { kind: 'date'; key: string; date: Date }
  | { kind: 'message'; key: string; message: ParsedMessage; listIndex: number };

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function MessageList() {
  const {
    messages, participants, searchQuery,
    searchMatchIndex, setSearchMatchIds,
  } = useChatStore();

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  // Map participant name → color
  const colorMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of participants) m[p.name] = p.color;
    return m;
  }, [participants]);

  // Compute search matches
  const matchData = useMemo(() => {
    if (!searchQuery.trim()) return { filtered: messages, matchIds: [] as string[] };
    const q = searchQuery.toLowerCase();
    const matchIds: string[] = [];
    const filtered = messages.filter((m) => {
      const matches = m.text.toLowerCase().includes(q) || m.sender.toLowerCase().includes(q);
      if (matches) matchIds.push(m.id);
      return matches;
    });
    return { filtered, matchIds };
  }, [messages, searchQuery]);

  // Push match IDs to store
  useEffect(() => {
    setSearchMatchIds(matchData.matchIds);
  }, [matchData.matchIds, setSearchMatchIds]);

  // Build flat list with date separators injected
  const items: ListItem[] = useMemo(() => {
    const result: ListItem[] = [];
    let lastDate: Date | null = null;
    for (const msg of matchData.filtered) {
      if (!lastDate || !isSameDay(lastDate, msg.date)) {
        result.push({ kind: 'date', key: `date-${msg.date.toDateString()}`, date: msg.date, } as ListItem);
        lastDate = msg.date;
      }
      result.push({ kind: 'message', key: msg.id, message: msg, listIndex: result.length });
    }
    return result;
  }, [matchData.filtered]);

  // Scroll to active search match
  const activeMatchId = matchData.matchIds[searchMatchIndex];
  useEffect(() => {
    if (!activeMatchId || !virtuosoRef.current) return;
    const idx = items.findIndex(
      (item) => item.kind === 'message' && item.key === activeMatchId
    );
    if (idx >= 0) {
      virtuosoRef.current.scrollToIndex({ index: idx, align: 'center', behavior: 'smooth' });
    }
  }, [activeMatchId, items]);

  // Determine if group chat
  const isGroup = participants.length > 2;

  if (matchData.filtered.length === 0 && searchQuery) {
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
        ref={virtuosoRef}
        className="chat-scroll"
        style={{ height: '100%' }}
        data={items}
        followOutput={!searchQuery ? 'smooth' : false}
        initialTopMostItemIndex={Math.max(0, items.length - 1)}
        itemContent={(_, item) => {
          if (item.kind === 'date') {
            return <DateSeparator key={item.key} date={item.date} />;
          }
          const msg = item.message;
          const isActiveMatch = msg.id === activeMatchId;
          return (
            <MessageBubble
              key={item.key}
              message={msg}
              showSenderName={isGroup && msg.type !== 'system'}
              senderColor={colorMap[msg.sender] ?? 'var(--wa-accent)'}
              searchQuery={searchQuery}
              isActiveSearchMatch={isActiveMatch}
            />
          );
        }}
      />
    </div>
  );
}
