'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { recipesApi } from '@/lib/api';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { RecipeFilters, type RecipeFilterValues } from '@/components/recipe/RecipeFilters';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { DemoModeBanner } from '@/components/ui/DemoModeBanner';
import { Heart } from '@phosphor-icons/react';
import { useToast } from '@/components/ui/Toast';
import { RECIPES_PAGE_SIZE } from '@/lib/constants';
import type { Recipe } from '@/types/api';
import { useAuthStore } from '@/store/auth';
import { demoRecipes } from '@/lib/demoData';
import { GUEST_DEMO_ENABLED } from '@/lib/demoMode';

const DEFAULT_FILTERS: RecipeFilterValues = {
  search: '',
  difficulty: '',
  max_cook_time: undefined,
  sort_by: 'created_at',
  sort_order: 'desc',
};

export default function RecipesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { isAuthenticated, hasHydrated, isLoading: isAuthLoading } = useAuthStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [filters, setFilters] = useState<RecipeFilterValues>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isGuestDemo = GUEST_DEMO_ENABLED && hasHydrated && !isAuthLoading && !isAuthenticated;

  const getFilteredDemoRecipes = useCallback((activeFilters: RecipeFilterValues) => {
    let filtered = [...demoRecipes];

    if (showFavoritesOnly) {
      filtered = filtered.filter((recipe) => recipe.is_favorite);
    }

    if (activeFilters.search) {
      const search = activeFilters.search.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(search) ||
          recipe.description?.toLowerCase().includes(search)
      );
    }

    if (activeFilters.difficulty) {
      filtered = filtered.filter((recipe) => recipe.difficulty === activeFilters.difficulty);
    }

    if (activeFilters.max_cook_time !== undefined) {
      filtered = filtered.filter((recipe) => (recipe.cook_time ?? 0) <= activeFilters.max_cook_time!);
    }

    filtered.sort((a, b) => {
      const direction = activeFilters.sort_order === 'asc' ? 1 : -1;

      if (activeFilters.sort_by === 'title') {
        return direction * a.title.localeCompare(b.title);
      }
      if (activeFilters.sort_by === 'cook_time') {
        return direction * ((a.cook_time ?? 0) - (b.cook_time ?? 0));
      }
      if (activeFilters.sort_by === 'times_made') {
        return direction * ((a.times_made ?? 0) - (b.times_made ?? 0));
      }
      return direction * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });

    return filtered;
  }, [showFavoritesOnly]);

  const loadRecipes = useCallback(async (reset = true, currentFilters?: RecipeFilterValues) => {
    const activeFilters = currentFilters ?? filters;
    if (reset) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    if (isGuestDemo) {
      const filtered = getFilteredDemoRecipes(activeFilters);
      const offset = reset ? 0 : recipes.length;
      const nextPage = filtered.slice(offset, offset + RECIPES_PAGE_SIZE);

      if (reset) {
        setRecipes(nextPage);
      } else {
        setRecipes((prev) => [...prev, ...nextPage]);
      }

      setHasMore(offset + nextPage.length < filtered.length);
      setIsLoading(false);
      setIsLoadingMore(false);
      return;
    }

    try {
      const offset = reset ? 0 : recipes.length;
      const apiFilters: Record<string, string | number> = {};
      if (activeFilters.search) apiFilters.search = activeFilters.search;
      if (activeFilters.difficulty) apiFilters.difficulty = activeFilters.difficulty;
      if (activeFilters.max_cook_time !== undefined) apiFilters.max_cook_time = activeFilters.max_cook_time;
      if (activeFilters.sort_by !== 'created_at') apiFilters.sort_by = activeFilters.sort_by;
      if (activeFilters.sort_order !== 'desc') apiFilters.sort_order = activeFilters.sort_order;

      const data = await recipesApi.list(showFavoritesOnly, RECIPES_PAGE_SIZE, offset, apiFilters);

      if (reset) {
        setRecipes(data);
      } else {
        setRecipes((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === RECIPES_PAGE_SIZE);
    } catch {
      addToast({
        type: 'error',
        title: 'Error loading recipes',
        message: 'Could not load your recipes. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [showFavoritesOnly, recipes.length, addToast, filters, isGuestDemo, getFilteredDemoRecipes]);

  // Reload on favorites toggle or non-search filter changes
  useEffect(() => {
    if (!hasHydrated) return;
    loadRecipes(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, showFavoritesOnly, filters.difficulty, filters.max_cook_time, filters.sort_by, filters.sort_order, isGuestDemo]);

  const handleFiltersChange = (newFilters: RecipeFilterValues) => {
    setFilters(newFilters);

    // Debounce search input
    if (newFilters.search !== filters.search) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        loadRecipes(true, newFilters);
      }, 400);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl mb-1">Your Recipes</h1>
          <p className="text-charcoal/70">
            {recipes.length} {showFavoritesOnly ? 'favorite' : ''} recipe{recipes.length !== 1 ? 's' : ''}
          </p>
        </div>

        <Button
          variant={showFavoritesOnly ? 'primary' : 'outline'}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          iconLeft={<Heart size={18} weight={showFavoritesOnly ? 'fill' : 'regular'} />}
        >
          Favorites
        </Button>
      </div>

      {/* Search & Filters */}
      <RecipeFilters filters={filters} onChange={handleFiltersChange} />

      {isGuestDemo && (
        <DemoModeBanner
          message="These recipes are polished sample data for recruiters. Sign in to generate and save your own."
          ctaLabel="Sign In To Cook Live"
          ctaHref="/login?redirect=/scan"
        />
      )}

      {/* Recipe Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce-dot" />
            <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce-dot-delay-1" />
            <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce-dot-delay-2" />
          </div>
        </div>
      ) : recipes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe, index) => (
              <div
                key={recipe.id}
                className="animate-scale-in"
                style={{ animationDelay: `${Math.min(index, 6) * 35}ms` }}
              >
                <RecipeCard
                  recipe={recipe}
                  onClick={() => router.push(`/recipes/${recipe.id}`)}
                />
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => loadRecipes(false)}
                isLoading={isLoadingMore}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card variant="elevated">
          <EmptyState
            variant={showFavoritesOnly ? 'no-favorites' : 'no-recipes'}
            onAction={showFavoritesOnly ? undefined : () => router.push(isGuestDemo ? '/login?redirect=/scan' : '/scan')}
          />
        </Card>
      )}
    </div>
  );
}
