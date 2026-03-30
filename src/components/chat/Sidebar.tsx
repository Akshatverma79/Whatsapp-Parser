'use client';

import { useMemo } from 'react';
import { useChatStore } from '@/store/chatStore';

export default function Sidebar() {
  const { participants, messages, title, ownerName } = useChatStore();

  const stats = useMemo(() => {
    const total = messages.length;
    const mediaCount = messages.filter((m) =>
      ['image', 'video', 'audio', 'document'].includes(m.type)
    ).length;

    // Date range
    const dates = messages.map((m) => m.date.getTime());
    const start = dates.length ? new Date(Math.min(...dates)) : null;
    const end = dates.length ? new Date(Math.max(...dates)) : null;

    // Busiest day
    const dayMap: Record<string, number> = {};
    for (const m of messages) {
      const day = m.date.toDateString();
      dayMap[day] = (dayMap[day] ?? 0) + 1;
    }
    const busiestDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];

    // Emoji count
    const emojiRegex = /\p{Emoji_Presentation}/gu;
    const emojiCount = messages.reduce((sum, m) => {
      return sum + (m.text.match(emojiRegex)?.length ?? 0);
    }, 0);

    return { total, mediaCount, start, end, busiestDay, emojiCount };
  }, [messages]);

  const sorted = [...participants].sort((a, b) => b.messageCount - a.messageCount);

  const fmtDate = (d: Date | null) =>
    d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="h-full flex flex-col overflow-y-auto"
      style={{ borderRight: '1px solid var(--wa-border)', background: 'var(--wa-bg-sidebar)' }}>
      {/* Header */}
      <div className="px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--wa-border)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1"
          style={{ color: 'var(--wa-text-muted)' }}>Chat Info</p>
        <p className="font-bold text-base truncate" style={{ color: 'var(--wa-text-primary)' }}>{title}</p>
        {stats.start && stats.end && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--wa-text-secondary)' }}>
            {fmtDate(stats.start)} – {fmtDate(stats.end)}
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 p-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--wa-border)' }}>
        {[
          { label: 'Messages', value: stats.total.toLocaleString(), icon: '💬' },
          { label: 'Media', value: stats.mediaCount.toLocaleString(), icon: '📎' },
          { label: 'Emojis', value: stats.emojiCount.toLocaleString(), icon: '😊' },
          { label: 'Participants', value: participants.length, icon: '👥' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg p-2.5" style={{ background: 'var(--wa-bg-received)' }}>
            <div className="text-lg">{s.icon}</div>
            <div className="text-base font-bold mt-0.5" style={{ color: 'var(--wa-text-primary)' }}>
              {s.value}
            </div>
            <div className="text-xs" style={{ color: 'var(--wa-text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Busiest day */}
      {stats.busiestDay && (
        <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--wa-border)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--wa-text-muted)' }}>
            BUSIEST DAY
          </p>
          <div className="rounded-lg p-2.5 flex items-center gap-2" style={{ background: 'var(--wa-bg-received)' }}>
            <span className="text-xl">🔥</span>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--wa-text-primary)' }}>
                {stats.busiestDay[0]}
              </p>
              <p className="text-xs" style={{ color: 'var(--wa-text-secondary)' }}>
                {stats.busiestDay[1].toLocaleString()} messages
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Participants */}
      <div className="px-3 py-3 flex-1">
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--wa-text-muted)' }}>
          PARTICIPANTS
        </p>
        <div className="flex flex-col gap-2">
          {sorted.map((p) => {
            const pct = stats.total > 0 ? Math.round((p.messageCount / stats.total) * 100) : 0;
            const isYou = p.name === ownerName;
            return (
              <div key={p.name} className="rounded-lg p-2.5" style={{ background: 'var(--wa-bg-received)' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: p.color, color: '#fff' }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--wa-text-primary)' }}>
                      {p.name} {isYou && <span style={{ color: 'var(--wa-accent)', fontSize: 11 }}>You</span>}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--wa-text-secondary)' }}>
                      {p.messageCount.toLocaleString()} · {pct}%
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--wa-border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
