'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { recipesApi, listsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Loading } from '@/components/ui/Loading';
import { Heart, Clock, ChefHat, Users, ShoppingCart, Check } from '@phosphor-icons/react';
import { formatTime } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params?.id as string;
  const { addToast } = useToast();

  const [recipe, setRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (recipeId) {
      loadRecipe();
    }
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      const data = await recipesApi.get(recipeId);
      setRecipe(data);
    } catch (error) {
      console.error('Error loading recipe:', error);
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
    setIsFavoriting(true);
    try {
      const updated = await recipesApi.toggleFavorite(recipeId);
      setRecipe(updated);
      addToast({
        type: 'success',
        title: updated.is_favorite ? 'Added to favorites' : 'Removed from favorites',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
    try {
      const updated = await recipesApi.incrementMade(recipeId);
      setRecipe(updated);
      addToast({
        type: 'success',
        title: 'Bon appétit!',
        message: 'Recipe marked as made.',
      });
    } catch (error) {
      console.error('Error incrementing made count:', error);
      addToast({
        type: 'error',
        title: 'Action failed',
        message: 'Could not update times made.',
      });
    }
  };

  const handleCreateShoppingList = async () => {
    setIsCreatingList(true);
    try {
      await listsApi.create(`Shopping for: ${recipe.title}`, recipeId);
      addToast({
        type: 'success',
        title: 'Shopping list created',
        message: 'Missing ingredients added to your list.',
      });
      router.push('/lists');
    } catch (error) {
      console.error('Error creating shopping list:', error);
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

  const availableIngredients = recipe.ingredients?.filter((ing: any) => ing.available) || [];
  const missingIngredients = recipe.ingredients?.filter((ing: any) => !ing.available) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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

          {recipe.servings && (
            <div className="flex items-center gap-2">
              <Users size={20} weight="duotone" />
              <span>{recipe.servings} servings</span>
            </div>
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
            <h3 className="text-lg font-medium text-sage mb-3">✓ You have these:</h3>
            <ul className="space-y-2">
              {availableIngredients.map((ingredient: any, index: number) => (
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
                </li>
              ))}
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
              {missingIngredients.map((ingredient: any, index: number) => (
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
