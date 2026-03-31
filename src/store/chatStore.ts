import { create } from 'zustand';
import { ParsedMessage, ChatParticipant, BlobStore } from '@/types';

export type Theme = 'dark' | 'light';

interface ChatState {
  // Session
  sessionId: string | null;
  title: string;
  ownerName: string | null;
  messages: ParsedMessage[];
  participants: ChatParticipant[];
  blobStore: BlobStore;

  // Upload state
  isLoading: boolean;
  loadingStage: string;
  loadingProgress: number;

  // UI state
  searchQuery: string;
  showOwnerModal: boolean;
  theme: Theme;

  // Search navigation
  searchMatchIndex: number;
  searchMatchIds: string[];

  // Date scrolling navigation
  scrollTargetDate: string | null;

  // Persistence
  hasSavedSession: boolean;

  // Actions
  setLoading: (loading: boolean, stage?: string, progress?: number) => void;
  setSession: (opts: {
    sessionId: string;
    title: string;
    messages: ParsedMessage[];
    participants: ChatParticipant[];
    blobStore: BlobStore;
    ownerName?: string | null;
  }) => void;
  setOwnerName: (name: string) => void;
  setShowOwnerModal: (show: boolean) => void;
  setSearchQuery: (q: string) => void;
  setSearchMatchIndex: (idx: number) => void;
  setSearchMatchIds: (ids: string[]) => void;
  setScrollTargetDate: (dateStr: string | null) => void;
  clearSession: () => void;
  resolveBlobUrl: (filename: string) => string | undefined;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  setHasSavedSession: (has: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessionId: null,
  title: '',
  ownerName: null,
  messages: [],
  participants: [],
  blobStore: {},
  isLoading: false,
  loadingStage: '',
  loadingProgress: 0,
  searchQuery: '',
  showOwnerModal: false,
  theme: 'dark',
  searchMatchIndex: 0,
  searchMatchIds: [],
  scrollTargetDate: null,
  hasSavedSession: false,

  setLoading: (loading, stage = '', progress = 0) =>
    set({ isLoading: loading, loadingStage: stage, loadingProgress: progress }),

  setSession: ({ sessionId, title, messages, participants, blobStore, ownerName = null }) =>
    set({
      sessionId,
      title,
      messages,
      participants,
      blobStore,
      ownerName,
      showOwnerModal: ownerName === null,
      isLoading: false,
      loadingProgress: 0,
      scrollTargetDate: null,
    }),

  setOwnerName: (name) => {
    const messages = get().messages.map((m) => ({ ...m, isOwn: m.sender === name }));
    set({ ownerName: name, messages, showOwnerModal: false });
  },

  setShowOwnerModal: (show) => set({ showOwnerModal: show }),
  setSearchQuery: (q) => set({ searchQuery: q, searchMatchIndex: 0, searchMatchIds: [], scrollTargetDate: null }),
  setSearchMatchIndex: (idx) => set({ searchMatchIndex: idx }),
  setSearchMatchIds: (ids) => set({ searchMatchIds: ids }),
  setScrollTargetDate: (dateStr) => set({ scrollTargetDate: dateStr, searchQuery: '', searchMatchIds: [] }),

  clearSession: () =>
    set({
      sessionId: null,
      title: '',
      ownerName: null,
      messages: [],
      participants: [],
      blobStore: {},
      searchQuery: '',
      showOwnerModal: false,
      searchMatchIndex: 0,
      searchMatchIds: [],
      scrollTargetDate: null,
    }),

  resolveBlobUrl: (filename) => get().blobStore[filename],

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: next });
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('wa-theme', next);
    }
  },

  setTheme: (t) => {
    set({ theme: t });
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('wa-theme', t);
    }
  },

  setHasSavedSession: (has) => set({ hasSavedSession: has }),
}));
