'use client';

import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Clock, ChefHat, Heart } from '@phosphor-icons/react';
import { formatTime } from '@/lib/utils';

interface RecipeCardProps {
  recipe: any;
  onClick: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const availableCount = recipe.ingredients?.filter((ing: any) => ing.available).length || 0;
  const totalCount = recipe.ingredients?.length || 0;
  const availabilityPercent = totalCount > 0 ? Math.round((availableCount / totalCount) * 100) : 0;

  return (
    <Card hover onClick={onClick} className="h-full flex flex-col">
      <div className="flex-1 space-y-3">
        {/* Title */}
        <h3 className="text-xl font-semibold text-charcoal">{recipe.title}</h3>

        {/* Description */}
        {recipe.description && (
          <p className="text-charcoal/70 line-clamp-2">{recipe.description}</p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-3 text-sm text-charcoal/60">
          {recipe.cook_time && (
            <div className="flex items-center gap-1">
              <Clock size={16} weight="duotone" />
              <span>{formatTime(recipe.cook_time)}</span>
            </div>
          )}

          {recipe.difficulty && (
            <div className="flex items-center gap-1">
              <ChefHat size={16} weight="duotone" />
              <span className="capitalize">{recipe.difficulty}</span>
            </div>
          )}

          {recipe.is_favorite && (
            <div className="flex items-center gap-1 text-terracotta">
              <Heart size={16} weight="fill" />
              <span>Favorite</span>
            </div>
          )}
        </div>

        {/* Ingredient Availability */}
        {totalCount > 0 && (
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-charcoal/70">
                You have {availableCount} of {totalCount} ingredients
              </span>
              <span className="font-medium text-sage">{availabilityPercent}%</span>
            </div>
            <div className="w-full bg-charcoal/10 rounded-full h-2">
              <div
                className="bg-sage h-2 rounded-full transition-all duration-300"
                style={{ width: `${availabilityPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Times Made */}
        {recipe.times_made > 0 && (
          <Tag variant="info" size="sm">
            Made {recipe.times_made} {recipe.times_made === 1 ? 'time' : 'times'}
          </Tag>
        )}
      </div>
    </Card>
  );
};
