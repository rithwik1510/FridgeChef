'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { recipesApi } from '@/lib/api';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Camera, Heart } from '@phosphor-icons/react';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';

export default function RecipesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, [showFavoritesOnly]);

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      const data = await recipesApi.list(showFavoritesOnly);
      setRecipes(data);
    } catch (error) {
      console.error('Error loading recipes:', error);
      addToast({
        type: 'error',
        title: 'Error loading recipes',
        message: 'Could not load your recipes. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="shimmer h-10 w-48 rounded-lg mb-2" />
            <div className="shimmer h-5 w-24 rounded-lg" />
          </div>
          <div className="shimmer h-10 w-32 rounded-xl" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} hasImage={false} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
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

      {/* Recipe Grid */}
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((recipe, index) => (
            <div
              key={recipe.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <RecipeCard
                recipe={recipe}
                onClick={() => router.push(`/recipes/${recipe.id}`)}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card variant="elevated" className="animate-fade-in">
          <EmptyState
            variant={showFavoritesOnly ? 'no-favorites' : 'no-recipes'}
            onAction={showFavoritesOnly ? undefined : () => router.push('/scan')}
          />
        </Card>
      )}
    </div>
  );
}
