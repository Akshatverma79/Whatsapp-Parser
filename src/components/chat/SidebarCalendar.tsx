'use client';

import { useState, useMemo } from 'react';
import { useChatStore } from '@/store/chatStore';

export default function SidebarCalendar({ activeDays }: { activeDays: Set<string> }) {
  const { scrollTargetDate, setScrollTargetDate } = useChatStore();

  const initialMonth = useMemo(() => {
    if (activeDays.size === 0) return new Date();
    const sorted = Array.from(activeDays).sort();
    const latest = new Date(sorted[sorted.length - 1]);
    return new Date(latest.getFullYear(), latest.getMonth(), 1);
  }, [activeDays]);

  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  // We'll use Monday as the first day of the week for a universally nice feel, or Sunday (0 = Sun). Let's use Sunday as 0.
  const startDayOfWeek = currentMonth.getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null); // empty padding
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--wa-border)' }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--wa-text-muted)' }}>
        Jump to Date
      </p>
      
      <div className="rounded-xl p-3" style={{ background: 'var(--wa-bg-received)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: 'var(--wa-text-secondary)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span className="text-sm font-semibold" style={{ color: 'var(--wa-text-primary)' }}>{monthName}</span>
          <button onClick={nextMonth} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: 'var(--wa-text-secondary)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold" style={{ color: 'var(--wa-text-muted)' }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            
            // Reconstruct YYYY-MM-DD
            const y = currentMonth.getFullYear();
            const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
            const d = String(day).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;
            
            const isActive = activeDays.has(dateStr);
            const isSelected = scrollTargetDate === dateStr;

            return (
              <button
                key={dateStr}
                disabled={!isActive}
                onClick={() => setScrollTargetDate(isSelected ? null : dateStr)}
                className={`relative flex items-center justify-center w-8 h-8 mx-auto rounded-full text-xs font-medium transition-all
                  ${!isActive ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                  ${isSelected ? 'shadow-sm' : 'hover:scale-110'}
                `}
                style={{
                  background: isSelected ? 'var(--wa-accent)' : 'transparent',
                  color: isSelected ? '#fff' : 'var(--wa-text-primary)',
                }}
              >
                {day}
                {isActive && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: 'var(--wa-accent)' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
