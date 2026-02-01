'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { hasHydrated, checkAuth, token } = useAuthStore();

  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage
    if (!hasHydrated) return;

    // If there's a token, validate it with the server
    if (token) {
      checkAuth();
    }
  }, [hasHydrated, token, checkAuth]);

  // Always render children - individual pages handle their own auth checks
  // This prevents blank page during hydration
  return <>{children}</>;
}
