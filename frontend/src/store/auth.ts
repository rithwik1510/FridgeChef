import { create } from 'zustand';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  preferences: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('auth_token', data.access_token);
    const user = await authApi.getMe();
    set({ user, token: data.access_token, isAuthenticated: true });
  },

  register: async (email: string, password: string, name?: string) => {
    const data = await authApi.register(email, password, name);
    localStorage.setItem('auth_token', data.access_token);
    const user = await authApi.getMe();
    set({ user, token: data.access_token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');

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
      localStorage.removeItem('auth_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },
}));
