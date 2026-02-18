'use client';

import { Minus, Plus, Users } from '@phosphor-icons/react';

interface ServingsAdjusterProps {
  servings: number;
  originalServings: number;
  onChange: (servings: number) => void;
}

export const ServingsAdjuster: React.FC<ServingsAdjusterProps> = ({
  servings,
  originalServings,
  onChange,
}) => {
  const isScaled = servings !== originalServings;

  return (
    <div className="flex items-center gap-3">
      <Users size={20} weight="duotone" className="text-charcoal/70" />
      <button
        onClick={() => onChange(Math.max(1, servings - 1))}
        disabled={servings <= 1}
        className="w-8 h-8 rounded-lg bg-cream-dark flex items-center justify-center text-charcoal/70 hover:bg-terracotta/10 hover:text-terracotta transition-all duration-200 disabled:opacity-30 disabled:hover:bg-cream-dark disabled:hover:text-charcoal/70"
      >
        <Minus size={16} weight="bold" />
      </button>
      <span className={`text-base font-medium min-w-[80px] text-center ${isScaled ? 'text-terracotta' : 'text-charcoal'}`}>
        {servings} serving{servings !== 1 ? 's' : ''}
      </span>
      <button
        onClick={() => onChange(Math.min(50, servings + 1))}
        disabled={servings >= 50}
        className="w-8 h-8 rounded-lg bg-cream-dark flex items-center justify-center text-charcoal/70 hover:bg-terracotta/10 hover:text-terracotta transition-all duration-200 disabled:opacity-30"
      >
        <Plus size={16} weight="bold" />
      </button>
      {isScaled && (
        <button
          onClick={() => onChange(originalServings)}
          className="text-xs text-terracotta font-medium hover:underline ml-1"
        >
          Reset
        </button>
      )}
    </div>
  );
};
