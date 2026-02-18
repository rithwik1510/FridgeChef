import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';

// Safe localStorage wrapper for private browsing mode compatibility
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail in private browsing mode
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail in private browsing mode
    }
  },
};

export interface UserPreferences {
  dietary_restrictions?: string[];
  cuisine_preferences?: string[];
  allergies?: string[];
  default_servings?: number;
  theme?: 'light' | 'dark' | 'system';
}

interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  preferences: UserPreferences | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      hasHydrated: false,

  login: async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    safeLocalStorage.setItem('auth_token', data.access_token);
    if (data.refresh_token) {
      safeLocalStorage.setItem('refresh_token', data.refresh_token);
    }
    const user = await authApi.getMe();
    set({ user, token: data.access_token, isAuthenticated: true });
  },

  register: async (email: string, password: string, name?: string) => {
    const data = await authApi.register(email, password, name);
    safeLocalStorage.setItem('auth_token', data.access_token);
    if (data.refresh_token) {
      safeLocalStorage.setItem('refresh_token', data.refresh_token);
    }
    const user = await authApi.getMe();
    set({ user, token: data.access_token, isAuthenticated: true });
  },

  logout: () => {
    safeLocalStorage.removeItem('auth_token');
    safeLocalStorage.removeItem('refresh_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = safeLocalStorage.getItem('auth_token');

    if (!token) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
      return;
    }

    try {
      const user = await authApi.getMe();
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      // If token is invalid, clear everything
      safeLocalStorage.removeItem('auth_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  setHasHydrated: (state: boolean) => {
    set({ hasHydrated: state });
  },
}),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
