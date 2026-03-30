'use client';

import { useMemo, useState } from 'react';
import { useChatStore } from '@/store/chatStore';

export default function Sidebar() {
  const { participants, messages, title, ownerName } = useChatStore();
  const [collapsed, setCollapsed] = useState(false);

  const stats = useMemo(() => {
    const total = messages.length;
    const mediaCount = messages.filter((m) =>
      ['image', 'video', 'audio', 'document'].includes(m.type)
    ).length;

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
    <div className="h-full flex flex-col overflow-hidden"
      style={{ borderRight: '1px solid var(--wa-border)', background: 'var(--wa-bg-sidebar)' }}>
      
      {/* Title bar */}
      <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--wa-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(145deg, #00a884, #25d366)', color: '#fff' }}>
            {(title || 'C').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[15px] truncate" style={{ color: 'var(--wa-text-primary)' }}>{title}</p>
            {stats.start && stats.end && (
              <p className="text-xs" style={{ color: 'var(--wa-text-secondary)' }}>
                {fmtDate(stats.start)} – {fmtDate(stats.end)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick stats */}
        <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--wa-border)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3"
            style={{ color: 'var(--wa-text-muted)' }}>Overview</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Messages', value: stats.total.toLocaleString(), icon: '💬' },
              { label: 'Media', value: stats.mediaCount.toLocaleString(), icon: '📎' },
              { label: 'Emojis', value: stats.emojiCount.toLocaleString(), icon: '😊' },
              { label: 'People', value: participants.length, icon: '👥' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3 flex items-center gap-2.5"
                style={{ background: 'var(--wa-bg-received)' }}>
                <span className="text-xl">{s.icon}</span>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--wa-text-primary)' }}>{s.value}</div>
                  <div className="text-[10px]" style={{ color: 'var(--wa-text-muted)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Busiest day */}
        {stats.busiestDay && (
          <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--wa-border)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--wa-text-muted)' }}>Most Active Day</p>
            <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--wa-bg-received)' }}>
              <span className="text-2xl">🔥</span>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--wa-text-primary)' }}>
                  {new Date(stats.busiestDay[0]).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs" style={{ color: 'var(--wa-text-secondary)' }}>
                  {stats.busiestDay[1].toLocaleString()} messages
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Participants */}
        <div className="px-4 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3"
            style={{ color: 'var(--wa-text-muted)' }}>
            Participants ({participants.length})
          </p>
          <div className="flex flex-col gap-2">
            {sorted.map((p) => {
              const pct = stats.total > 0 ? Math.round((p.messageCount / stats.total) * 100) : 0;
              const isYou = p.name === ownerName;
              return (
                <div key={p.name} className="rounded-xl p-3" style={{ background: 'var(--wa-bg-received)' }}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: p.color + '33', color: p.color }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--wa-text-primary)' }}>
                          {p.name}
                        </p>
                        {isYou && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: 'var(--wa-accent-muted)', color: 'var(--wa-accent)' }}>
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: 'var(--wa-text-secondary)' }}>
                        {p.messageCount.toLocaleString()} messages · {pct}%
                      </p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--wa-border)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: p.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
