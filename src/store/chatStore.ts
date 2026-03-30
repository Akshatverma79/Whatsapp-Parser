import { create } from 'zustand';
import { ParsedMessage, ChatParticipant, BlobStore } from '@/types';

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
  clearSession: () => void;
  resolveBlobUrl: (filename: string) => string | undefined;
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
    }),

  setOwnerName: (name) => {
    const messages = get().messages.map((m) => ({ ...m, isOwn: m.sender === name }));
    set({ ownerName: name, messages, showOwnerModal: false });
  },

  setShowOwnerModal: (show) => set({ showOwnerModal: show }),
  setSearchQuery: (q) => set({ searchQuery: q }),

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
    }),

  resolveBlobUrl: (filename) => get().blobStore[filename],
}));
