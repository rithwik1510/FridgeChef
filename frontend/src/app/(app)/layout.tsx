'use client';

import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-lightest flex items-center justify-center">
        <div className="text-center">
          <div className="shimmer h-8 w-32 mx-auto rounded-lg mb-4" />
          <p className="text-charcoal/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-cream-lightest">
        <Header />
        <Navigation />
        <Sidebar />

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
    </ToastProvider>
  );
}
