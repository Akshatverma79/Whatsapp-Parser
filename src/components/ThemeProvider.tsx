'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useChatStore();

  useEffect(() => {
    // Apply theme to html element
    document.documentElement.setAttribute('data-theme', theme);
    // Also apply to body as fallback
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Initialize theme on mount
  useEffect(() => {
    const stored = localStorage.getItem('wa-theme') as 'dark' | 'light' | null;
    if (stored) {
      useChatStore.getState().setTheme(stored);
    }
  }, []);

  return <>{children}</>;
}
