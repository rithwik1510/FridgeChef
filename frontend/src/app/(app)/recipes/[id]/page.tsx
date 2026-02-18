'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { recipesApi, listsApi, pantryApi } from '@/lib/api';
import type { PantryItem, Recipe, RecipeIngredient } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Loading } from '@/components/ui/Loading';
import { ServingsAdjuster } from '@/components/recipe/ServingsAdjuster';
import { Heart, Clock, ChefHat, ShoppingCart, Check, Package } from '@phosphor-icons/react';
import { formatTime } from '@/lib/utils';
import { scaleIngredientAmount } from '@/lib/recipeScaling';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth';
import { demoPantryItems, demoRecipes } from '@/lib/demoData';
import { GUEST_DEMO_ENABLED } from '@/lib/demoMode';

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params?.id as string;
  const { addToast } = useToast();
  const { isAuthenticated, hasHydrated, isLoading: isAuthLoading } = useAuthStore();
  const isGuestDemo = GUEST_DEMO_ENABLED && hasHydrated && !isAuthLoading && !isAuthenticated;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [currentServings, setCurrentServings] = useState<number>(0);

  const originalServings = recipe?.servings || 2;
  const scalingRatio = currentServings > 0 ? currentServings / originalServings : 1;

  // Scale ingredient amounts based on servings
  const scaledIngredients = useMemo(() => {
    if (!recipe?.ingredients || scalingRatio === 1) return recipe?.ingredients || [];
    return recipe.ingredients.map((ing: RecipeIngredient) => ({
      ...ing,
      amount: ing.amount ? scaleIngredientAmount(ing.amount, scalingRatio) : ing.amount,
    }));
  }, [recipe?.ingredients, scalingRatio]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (recipeId) {
      loadRecipe();
      loadPantry();
    }
  }, [recipeId, hasHydrated, isGuestDemo]);

  const loadPantry = async () => {
    if (isGuestDemo) {
      setPantryItems(demoPantryItems);
      return;
    }

    try {
      const response = await pantryApi.list();
      setPantryItems(response.items);
    } catch {
      // Silently fail - pantry check is optional enhancement
    }
  };

  // Check if ingredient is in pantry (fuzzy match)
  const isInPantry = (ingredientName: string): boolean => {
    const nameLower = ingredientName.toLowerCase();
    return pantryItems.some(p =>
      p.name.toLowerCase().includes(nameLower) ||
      nameLower.includes(p.name.toLowerCase())
    );
  };

  const loadRecipe = async () => {
    if (isGuestDemo) {
      const sampleRecipe = demoRecipes.find((item) => item.id === recipeId);
      if (!sampleRecipe) {
        addToast({
          type: 'info',
          title: 'Demo recipe not found',
          message: 'Showing available demo recipes instead.',
        });
        router.push('/recipes');
        setIsLoading(false);
        return;
      }
      setRecipe(sampleRecipe);
      setCurrentServings(sampleRecipe.servings || 2);
      setIsLoading(false);
      return;
    }

    try {
      const data = await recipesApi.get(recipeId);
      setRecipe(data);
      setCurrentServings(data.servings || 2);
    } catch {
      addToast({
        type: 'error',
        title: 'Error loading recipe',
        message: 'Could not load the recipe details.',
      });
      router.push('/recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (isGuestDemo) {
      addToast({
        type: 'info',
        title: 'Sign in to save favorites',
        message: 'You are currently viewing a read-only guest demo.',
      });
      router.push(`/login?redirect=/recipes/${recipeId}`);
      return;
    }

    setIsFavoriting(true);
    try {
      const updated = await recipesApi.toggleFavorite(recipeId);
      setRecipe(updated);
      addToast({
        type: 'success',
        title: updated.is_favorite ? 'Added to favorites' : 'Removed from favorites',
        duration: 2000,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Action failed',
        message: 'Could not update favorite status.',
      });
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleMade = async () => {
    if (isGuestDemo) {
      addToast({
        type: 'info',
        title: 'Sign in to track progress',
        message: 'Marking recipes as made is available after login.',
      });
      router.push(`/login?redirect=/recipes/${recipeId}`);
      return;
    }

    try {
      const updated = await recipesApi.incrementMade(recipeId);
      setRecipe(updated);
      addToast({
        type: 'success',
        title: 'Bon appétit!',
        message: 'Recipe marked as made.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Action failed',
        message: 'Could not update times made.',
      });
    }
  };

  const handleCreateShoppingList = async () => {
    if (!recipe) return;

    if (isGuestDemo) {
      addToast({
        type: 'info',
        title: 'Sign in to create shopping lists',
        message: 'Guest mode is read-only for recruiter-friendly browsing.',
      });
      router.push(`/login?redirect=/recipes/${recipeId}`);
      return;
    }

    setIsCreatingList(true);
    try {
      await listsApi.create(`Shopping for: ${recipe.title}`, recipeId);
      addToast({
        type: 'success',
        title: 'Shopping list created',
        message: 'Missing ingredients added to your list.',
      });
      router.push('/lists');
    } catch {
      addToast({
        type: 'error',
        title: 'Error creating list',
        message: 'Failed to create shopping list.',
      });
    } finally {
      setIsCreatingList(false);
    }
  };

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  if (isLoading) {
    return <Loading message="Loading recipe..." />;
  }

  if (!recipe) {
    return null;
  }

  // Enhanced ingredient availability check
  // Recipe might have 'available' from generation, but we also check pantry
  const getIngredientAvailability = (ing: RecipeIngredient): 'available' | 'in-pantry' | 'missing' => {
    if (ing.available) return 'available';
    if (isInPantry(ing.name)) return 'in-pantry';
    return 'missing';
  };

  const availableIngredients = scaledIngredients.filter(
    (ing: RecipeIngredient) => getIngredientAvailability(ing) !== 'missing'
  );
  const missingIngredients = scaledIngredients.filter(
    (ing: RecipeIngredient) => getIngredientAvailability(ing) === 'missing'
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {isGuestDemo && (
        <Card variant="glass" className="border border-terracotta/20">
          <p className="text-sm text-charcoal/80 text-center mb-0">
            Guest demo mode: this recipe is interactive for preview, but saving actions require sign-in.
          </p>
        </Card>
      )}

      {/* Header */}
      <div>
        <div className="flex justify-between items-start gap-4 mb-4">
          <h1 className="text-4xl md:text-5xl">{recipe.title}</h1>
          <Button
            variant={recipe.is_favorite ? 'primary' : 'outline'}
            onClick={handleToggleFavorite}
            isLoading={isFavoriting}
            className="flex-shrink-0"
          >
            <Heart size={20} weight={recipe.is_favorite ? 'fill' : 'regular'} />
          </Button>
        </div>

        {recipe.description && (
          <p className="text-xl text-charcoal/70 mb-6">{recipe.description}</p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 text-charcoal/70">
          {recipe.cook_time && (
            <div className="flex items-center gap-2">
              <Clock size={20} weight="duotone" />
              <span>{formatTime(recipe.cook_time)}</span>
            </div>
          )}

          {recipe.difficulty && (
            <div className="flex items-center gap-2">
              <ChefHat size={20} weight="duotone" />
              <span className="capitalize">{recipe.difficulty}</span>
            </div>
          )}

          {currentServings > 0 && (
            <ServingsAdjuster
              servings={currentServings}
              originalServings={originalServings}
              onChange={setCurrentServings}
            />
          )}

          {recipe.times_made > 0 && (
            <Tag variant="info">Made {recipe.times_made}x</Tag>
          )}
        </div>
      </div>

      {/* Ingredients */}
      <Card>
        <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>

        {availableIngredients.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-sage mb-3 flex items-center gap-2">
              <Check size={20} weight="bold" />
              You have these:
            </h3>
            <ul className="space-y-2">
              {availableIngredients.map((ingredient: RecipeIngredient, index: number) => {
                const availability = getIngredientAvailability(ingredient);
                const fromPantry = availability === 'in-pantry';
                return (
                  <li
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-sage/5 cursor-pointer"
                    onClick={() => toggleIngredient(index)}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        checkedIngredients.has(index)
                          ? 'bg-sage border-sage'
                          : 'border-charcoal/30'
                      }`}
                    >
                      {checkedIngredients.has(index) && (
                        <Check size={14} weight="bold" className="text-cream" />
                      )}
                    </div>
                    <span className={checkedIngredients.has(index) ? 'line-through text-charcoal/50' : ''}>
                      {ingredient.amount} {ingredient.name}
                    </span>
                    {fromPantry && (
                      <span className="flex items-center gap-1 text-xs text-sage bg-sage/10 px-2 py-0.5 rounded-full">
                        <Package size={12} weight="bold" />
                        Pantry
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {missingIngredients.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-charcoal/70">You're just missing:</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCreateShoppingList}
                isLoading={isCreatingList}
                className="gap-2"
              >
                <ShoppingCart size={16} weight="bold" />
                Shopping List
              </Button>
            </div>
            <ul className="space-y-2">
              {missingIngredients.map((ingredient: RecipeIngredient, index: number) => (
                <li key={index} className="flex items-center gap-3 p-2">
                  <span className="text-charcoal/70">
                    {ingredient.amount} {ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Instructions */}
      <Card>
        <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
        <ol className="space-y-4">
          {recipe.instructions?.map((instruction: string, index: number) => (
            <li key={index} className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-terracotta/20 text-terracotta font-semibold flex items-center justify-center">
                {index + 1}
              </span>
              <p className="flex-1 pt-1">{instruction}</p>
            </li>
          ))}
        </ol>
      </Card>

      {/* Action Button */}
      <div className="flex gap-4">
        <Button variant="primary" size="lg" onClick={handleMade} className="flex-1">
          I Made This!
        </Button>
      </div>
    </div>
  );
}
