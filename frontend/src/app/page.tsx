'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, hasHydrated, checkAuth } = useAuthStore();

  // Validate token with server after hydration
  useEffect(() => {
    if (hasHydrated) {
      checkAuth();
    }
  }, [hasHydrated, checkAuth]);

  // Redirect to dashboard if already authenticated (only after hydration)
  useEffect(() => {
    if (hasHydrated && !isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [hasHydrated, isAuthenticated, isLoading, router]);

  // Show loading state while checking auth
  // Note: On server, hasHydrated is false, so we show the page content
  // On client, we wait for hydration before making redirect decisions
  const isClient = typeof window !== 'undefined';
  if (isClient && (!hasHydrated || isLoading)) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-cream to-cream-dark">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo/Title */}
        <h1 className="text-6xl md:text-7xl mb-6 text-charcoal">
          FridgeChef
        </h1>

        {/* Tagline */}
        <p className="text-2xl md:text-3xl text-charcoal/80 mb-8 text-balance">
          What can I make with what I have?
        </p>

        {/* Description */}
        <p className="text-lg md:text-xl text-charcoal/60 mb-12 max-w-2xl mx-auto leading-relaxed">
          Upload a photo of your fridge, see what ingredients you have, get recipe ideas,
          and create shopping lists for what you're missing.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="lg" variant="primary" className="w-full sm:w-auto">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" variant="primary" className="w-full sm:w-auto font-fraunces">
                  Join the Kitchen
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-fraunces">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-cream-dark rounded-2xl p-6 shadow-soft">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-xl font-semibold mb-2 text-charcoal">Scan Your Fridge</h3>
            <p className="text-charcoal/70">
              Upload a photo and AI detects all your ingredients automatically
            </p>
          </div>

          <div className="bg-cream-dark rounded-2xl p-6 shadow-soft">
            <div className="text-4xl mb-4">🍳</div>
            <h3 className="text-xl font-semibold mb-2 text-charcoal">Get Recipes</h3>
            <p className="text-charcoal/70">
              Receive personalized recipe suggestions based on what you have
            </p>
          </div>

          <div className="bg-cream-dark rounded-2xl p-6 shadow-soft">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold mb-2 text-charcoal">Shop Smart</h3>
            <p className="text-charcoal/70">
              Create shopping lists for missing ingredients with one click
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
