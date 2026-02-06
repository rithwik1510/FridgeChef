'use client';

import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';
import { EasterEggsProvider } from '@/components/easter-eggs';
import { useAuthStore } from '@/store/auth';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hasHydrated, checkAuth } = useAuthStore();

  // Validate token with server after hydration (if user has a token)
  useEffect(() => {
    if (hasHydrated) {
      checkAuth();
    }
  }, [hasHydrated, checkAuth]);

  // Allow public browsing - render layout regardless of auth state
  // Individual pages (like scan) will handle their own auth requirements

  return (
    <ToastProvider>
      <EasterEggsProvider>
        <div className="min-h-screen bg-cream">
          <Header />
          <Navigation />
          <Sidebar />

          <InstallPrompt />

          {/* Main Content Area */}
          <main className="
            lg:ml-sidebar
            px-4 sm:px-6 lg:px-8
            py-6 lg:py-8
            pb-24 lg:pb-8
            min-h-[calc(100vh-64px)]
          ">
            <div className="max-w-5xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </EasterEggsProvider>
    </ToastProvider>
  );
}
