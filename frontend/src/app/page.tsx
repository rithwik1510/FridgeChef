'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Camera, CookingPot, Package } from '@phosphor-icons/react';
import { GUEST_DEMO_ENABLED } from '@/lib/demoMode';

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
          and manage your pantry inventory.
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
              {GUEST_DEMO_ENABLED && (
                <Link href="/dashboard">
                  <Button size="lg" variant="primary" glow className="w-full sm:w-auto font-fraunces hover:-translate-y-0.5">
                    Explore Demo
                  </Button>
                </Link>
              )}
              <Link href="/register">
                <Button size="lg" variant={GUEST_DEMO_ENABLED ? 'outline' : 'primary'} className="w-full sm:w-auto font-fraunces hover:-translate-y-0.5">
                  Join the Kitchen
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant={GUEST_DEMO_ENABLED ? 'ghost' : 'outline'} className="w-full sm:w-auto font-fraunces hover:-translate-y-0.5">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>

        {GUEST_DEMO_ENABLED && !isAuthenticated && (
          <p className="mt-4 text-sm text-charcoal/55 animate-fade-in">
            Browse instantly in demo mode. Sign in when you want to use live AI features.
          </p>
        )}

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-cream-dark rounded-2xl p-6 shadow-soft">
            <div className="w-14 h-14 bg-terracotta/10 rounded-2xl flex items-center justify-center mb-4">
              <Camera size={28} className="text-terracotta" weight="duotone" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-charcoal">Scan Your Fridge</h3>
            <p className="text-charcoal/70">
              Upload a photo and AI detects all your ingredients automatically
            </p>
          </div>

          <div className="bg-cream-dark rounded-2xl p-6 shadow-soft">
            <div className="w-14 h-14 bg-sage/10 rounded-2xl flex items-center justify-center mb-4">
              <CookingPot size={28} className="text-sage" weight="duotone" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-charcoal">Get Recipes</h3>
            <p className="text-charcoal/70">
              Receive personalized recipe suggestions based on what you have
            </p>
          </div>

          <div className="bg-cream-dark rounded-2xl p-6 shadow-soft">
            <div className="w-14 h-14 bg-terracotta/10 rounded-2xl flex items-center justify-center mb-4">
              <Package size={28} className="text-terracotta" weight="duotone" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-charcoal">Track Your Pantry</h3>
            <p className="text-charcoal/70">
              Keep inventory of what you have on hand for better recipe suggestions
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
