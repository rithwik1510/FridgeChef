'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { recipesApi } from '@/lib/api';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Heart } from '@phosphor-icons/react';
import { useToast } from '@/components/ui/Toast';
import type { Recipe } from '@/types/api';

export default function RecipesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
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
      addToast({
        type: 'error',
        title: 'Error loading recipes',
        message: 'Could not load your recipes. Please try again.',
      });
    } finally {
      setIsLoading(false);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => router.push(`/recipes/${recipe.id}`)}
            />
          ))}
        </div>
      ) : (
        <Card variant="elevated">
          <EmptyState
            variant={showFavoritesOnly ? 'no-favorites' : 'no-recipes'}
            onAction={showFavoritesOnly ? undefined : () => router.push('/scan')}
          />
        </Card>
      )}
    </div>
  );
}
