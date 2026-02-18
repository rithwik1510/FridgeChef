'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { scansApi, recipesApi } from '@/lib/api';
import { DASHBOARD_PREVIEW_COUNT } from '@/lib/constants';
import { isHttpError } from '@/lib/errors';
import type { Scan, Recipe } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { DemoModeBanner } from '@/components/ui/DemoModeBanner';
import { Camera, ForkKnife, Package, ArrowRight, Clock, ChefHat } from '@phosphor-icons/react';
import { useToast } from '@/components/ui/Toast';
import { useSeasonalSurprise } from '@/hooks/useSeasonalSurprise';
import { useAuthStore } from '@/store/auth';
import { demoRecipes, demoScans } from '@/lib/demoData';
import { GUEST_DEMO_ENABLED } from '@/lib/demoMode';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { greeting, Icon, iconColor, iconBgColor, suggestion } = useSeasonalSurprise();
  const { isAuthenticated, hasHydrated, isLoading: isAuthLoading } = useAuthStore();
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isGuestDemo = GUEST_DEMO_ENABLED && hasHydrated && !isAuthLoading && !isAuthenticated;

  useEffect(() => {
    if (!hasHydrated) return;

    const loadData = async () => {
      if (isGuestDemo) {
        setRecentScans(demoScans.slice(0, DASHBOARD_PREVIEW_COUNT));
        setRecentRecipes(demoRecipes.slice(0, DASHBOARD_PREVIEW_COUNT));
        setIsLoading(false);
        return;
      }

      try {
        const [scans, recipes] = await Promise.all([
          scansApi.list(DASHBOARD_PREVIEW_COUNT, 0),
          recipesApi.list(false, DASHBOARD_PREVIEW_COUNT, 0),
        ]);
        setRecentScans(scans);
        setRecentRecipes(recipes);
      } catch (error: unknown) {
        // Ignore 401/403 errors as they are handled by the interceptor
        if (isHttpError(error, 401) || isHttpError(error, 403)) {
          return;
        }
        addToast({
          type: 'error',
          title: 'Connection error',
          message: 'Could not load your dashboard. Please check your connection.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [hasHydrated, isGuestDemo, addToast]);

  const handleScanAction = () => {
    router.push('/scan');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <div className={`w-16 h-16 ${iconBgColor} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
          <Icon size={32} className={iconColor} weight="duotone" />
        </div>
        <h1 className="text-3xl md:text-4xl mb-3">{greeting}</h1>
        <p className="text-lg text-charcoal/70 mb-6">
          {suggestion || 'What would you like to cook today?'}
        </p>

        <Button
          size="lg"
          variant="primary"
          iconLeft={<Camera size={22} weight="bold" />}
          glow
          onClick={handleScanAction}
        >
          {isGuestDemo ? 'Try Live Scan (Free)' : 'Scan Your Fridge'}
        </Button>
      </div>

      {isGuestDemo && (
        <DemoModeBanner
          message="Scan your actual fridge! Guests get 2 free live AI scans before needing an account."
          ctaLabel="Sign In For Unlimited"
          ctaHref="/login?redirect=/scan"
        />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          variant="elevated"
          hover
          compact
          onClick={handleScanAction}
          className="card-shine animate-scale-in"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-terracotta/10 rounded-xl">
              <Camera size={28} weight="duotone" className="text-terracotta" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Scan Fridge</h3>
              <p className="text-sm text-charcoal/70">
                Upload a photo to detect ingredients
              </p>
            </div>
          </div>
        </Card>

        <Card
          variant="elevated"
          hover
          compact
          onClick={() => router.push('/recipes')}
          className="card-shine animate-scale-in"
          style={{ animationDelay: '40ms' }}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-sage/10 rounded-xl">
              <ForkKnife size={28} weight="duotone" className="text-sage" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Browse Recipes</h3>
              <p className="text-sm text-charcoal/70">
                View your saved recipes and favorites
              </p>
            </div>
          </div>
        </Card>

        <Card
          variant="elevated"
          hover
          compact
          onClick={() => router.push('/pantry')}
          className="card-shine animate-scale-in"
          style={{ animationDelay: '80ms' }}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-butter/10 rounded-xl">
              <Package size={28} weight="duotone" className="text-butter-dark" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Pantry</h3>
              <p className="text-sm text-charcoal/70">
                Manage your ingredient inventory
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      {(recentScans.length > 0 || recentRecipes.length > 0) && (
        <div className="space-y-6">
          {recentScans.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Scans</h2>
                <Link
                  href="/scan"
                  className="flex items-center gap-1 text-sm text-terracotta hover:text-terracotta-dark"
                >
                  View all <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentScans.map((scan) => (
                  <Card
                    key={scan.id}
                    hover
                    compact
                    onClick={() => router.push('/scan')}
                    className="card-shine"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-terracotta/10 rounded-lg">
                        <Camera size={20} className="text-terracotta" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {scan.ingredients?.length || 0} ingredients
                        </p>
                        <p className="text-xs text-charcoal/60">
                          {new Date(scan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {recentRecipes.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Recipes</h2>
                <Link
                  href="/recipes"
                  className="flex items-center gap-1 text-sm text-terracotta hover:text-terracotta-dark"
                >
                  View all <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentRecipes.map((recipe) => (
                  <Card
                    key={recipe.id}
                    hover
                    compact
                    onClick={() => router.push(`/recipes/${recipe.id}`)}
                    className="card-shine"
                  >
                    <h3 className="text-lg font-semibold mb-1">{recipe.title}</h3>
                    <p className="text-sm text-charcoal/70 mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex gap-3 text-sm text-charcoal/60">
                      {recipe.cook_time && (
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {recipe.cook_time} min
                        </span>
                      )}
                      {recipe.difficulty && (
                        <span className="flex items-center gap-1">
                          <ChefHat size={14} />
                          <span className="capitalize">{recipe.difficulty}</span>
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {recentScans.length === 0 && recentRecipes.length === 0 && (
        <Card variant="elevated">
          <EmptyState
            variant="no-scans"
            onAction={handleScanAction}
          />
        </Card>
      )}
    </div>
  );
}
