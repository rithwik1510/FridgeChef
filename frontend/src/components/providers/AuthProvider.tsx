'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { hasHydrated, checkAuth, token } = useAuthStore();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage
    if (!hasHydrated) return;

    // If there's a token, validate it with the server
    if (token) {
      checkAuth().finally(() => {
        setHasCheckedAuth(true);
      });
    } else {
      // No token, no need to check with server
      setHasCheckedAuth(true);
    }
  }, [hasHydrated, token, checkAuth]);

  // Don't render until hydration is complete
  // This prevents flash of wrong auth state
  if (!hasHydrated) {
    return null;
  }

  return <>{children}</>;
}
