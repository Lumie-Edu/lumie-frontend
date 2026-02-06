'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { User, Role } from './schema';
import { storage } from '@/src/shared/lib/storage';

interface SessionState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

// Custom storage that syncs to both localStorage and cookie
const cookieSyncStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(name, value);
    // Sync to cookie for middleware access (7 days expiry)
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
    // Remove cookie
    document.cookie = `${name}=; path=/; max-age=0`;
  },
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: user !== null,
        }),

      login: (user) => {
        // Tokens are handled via HttpOnly cookies - no need to store them
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        storage.clearSession();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'lumie-session',
      storage: createJSONStorage(() => cookieSyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setLoading(false);
        }
      },
    }
  )
);

// Selector hooks for common use cases
export const useUser = () => useSessionStore((state) => state.user);
export const useIsAuthenticated = () => useSessionStore((state) => state.isAuthenticated);
export const useUserRole = (): Role | null => useSessionStore((state) => state.user?.role ?? null);
export const useIsAdmin = () =>
  useSessionStore((state) => state.user?.role === 'ADMIN' || state.user?.role === 'DEVELOPER');
export const useIsStudent = () => useSessionStore((state) => state.user?.role === 'STUDENT');
