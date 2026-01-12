/**
 * Store (State Management) using Zustand
 */

import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  posts?: number;
  followers?: number;
  following?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authToken: string | null;

  // Actions
  setUser: (user: User) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setAuthToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authToken: null,

  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setAuthToken: (authToken) => set({ authToken }),
  setLoading: (isLoading) => set({ isLoading }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      authToken: null,
    }),

  updateProfile: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));

export interface FeedState {
  // State
  posts: any[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;

  // Actions
  setPosts: (posts: any[]) => void;
  addPosts: (posts: any[]) => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  incrementPage: () => void;
  resetFeed: () => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  posts: [],
  isLoading: false,
  hasMore: true,
  page: 1,

  setPosts: (posts) => set({ posts }),
  addPosts: (posts) => set((state) => ({ posts: [...state.posts, ...posts] })),
  setLoading: (isLoading) => set({ isLoading }),
  setHasMore: (hasMore) => set({ hasMore }),
  incrementPage: () => set((state) => ({ page: state.page + 1 })),
  resetFeed: () => set({ posts: [], page: 1, hasMore: true }),
}));

export interface ChatState {
  // State
  conversations: any[];
  selectedConversation: any | null;
  messages: any[];
  isLoading: boolean;
  unreadCount: number;

  // Actions
  setConversations: (conversations: any[]) => void;
  setSelectedConversation: (conversation: any) => void;
  setMessages: (messages: any[]) => void;
  addMessage: (message: any) => void;
  setLoading: (loading: boolean) => void;
  setUnreadCount: (count: number) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  selectedConversation: null,
  messages: [],
  isLoading: false,
  unreadCount: 0,

  setConversations: (conversations) => set({ conversations }),
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (isLoading) => set({ isLoading }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  clearChat: () =>
    set({
      conversations: [],
      selectedConversation: null,
      messages: [],
      unreadCount: 0,
    }),
}));
