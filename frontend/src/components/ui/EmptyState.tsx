'use client';

import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  variant: 'no-scans' | 'no-recipes' | 'no-lists' | 'no-favorites' | 'no-pantry' | 'error' | 'custom';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

// SVG Illustrations
const EmptyFridgeIllustration = () => (
  <svg width="120" height="140" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Fridge body */}
    <rect x="20" y="20" width="80" height="110" rx="6" fill="#F0E9DC" stroke="#E5DBC8" strokeWidth="2" />

    {/* Freezer door */}
    <rect x="24" y="24" width="72" height="32" rx="4" fill="#FBF8F3" stroke="#E5DBC8" strokeWidth="1" />

    {/* Main door */}
    <rect x="24" y="60" width="72" height="66" rx="4" fill="#FBF8F3" stroke="#E5DBC8" strokeWidth="1" />

    {/* Handles */}
    <rect x="90" y="36" width="4" height="12" rx="2" fill="#C4704B" />
    <rect x="90" y="84" width="4" height="16" rx="2" fill="#C4704B" />

    {/* Empty shelves inside (dotted lines) */}
    <line x1="30" y1="80" x2="90" y2="80" stroke="#E5DBC8" strokeWidth="1" strokeDasharray="4 2" />
    <line x1="30" y1="100" x2="90" y2="100" stroke="#E5DBC8" strokeWidth="1" strokeDasharray="4 2" />

    {/* Sad face on freezer */}
    <circle cx="50" cy="38" r="2" fill="#C4704B" opacity="0.5" />
    <circle cx="70" cy="38" r="2" fill="#C4704B" opacity="0.5" />
    <path d="M52 46 Q60 42, 68 46" stroke="#C4704B" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />

    {/* Question mark floating */}
    <text x="100" y="20" fill="#C4704B" fontSize="20" fontFamily="sans-serif" opacity="0.6">?</text>
  </svg>
);

const ChefPuzzledIllustration = () => (
  <svg width="120" height="140" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Chef hat */}
    <ellipse cx="60" cy="22" rx="28" ry="12" fill="#F0E9DC" />
    <ellipse cx="50" cy="24" rx="16" ry="8" fill="#E5DBC8" />
    <ellipse cx="70" cy="24" rx="16" ry="8" fill="#E5DBC8" />
    <ellipse cx="60" cy="20" rx="20" ry="10" fill="#F0E9DC" />
    <rect x="40" y="28" width="40" height="10" rx="2" fill="#E5DBC8" />

    {/* Face */}
    <circle cx="60" cy="55" r="22" fill="#F5E6D3" />

    {/* Eyes - one raised eyebrow */}
    <circle cx="52" cy="52" r="3" fill="#2D2A26" />
    <circle cx="68" cy="52" r="3" fill="#2D2A26" />
    <path d="M46 48 Q52 44, 58 48" stroke="#2D2A26" strokeWidth="2" fill="none" />

    {/* Confused mouth */}
    <path d="M52 64 Q60 60, 68 64" stroke="#2D2A26" strokeWidth="2" fill="none" strokeLinecap="round" />

    {/* Body with apron */}
    <path d="M38 77 Q38 90, 45 105 L75 105 Q82 90, 82 77 Q70 85, 60 77 Q50 85, 38 77" fill="#F0E9DC" />
    <rect x="48" y="82" width="24" height="28" rx="2" fill="#C4704B" opacity="0.3" />

    {/* Arms scratching head */}
    <path d="M38 85 Q25 75, 35 55" stroke="#F5E6D3" strokeWidth="8" fill="none" strokeLinecap="round" />
    <circle cx="35" cy="55" r="5" fill="#F5E6D3" />

    {/* Question marks */}
    <text x="85" y="35" fill="#C4704B" fontSize="16" fontFamily="sans-serif" opacity="0.7">?</text>
    <text x="18" y="45" fill="#7D8B6E" fontSize="14" fontFamily="sans-serif" opacity="0.7">?</text>
  </svg>
);

const EmptyBasketIllustration = () => (
  <svg width="120" height="140" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Basket base */}
    <ellipse cx="60" cy="115" rx="40" ry="10" fill="#E5DBC8" />

    {/* Basket body */}
    <path d="M25 65 L30 110 Q60 125, 90 110 L95 65 Z" fill="#D98B6A" />

    {/* Basket weave pattern */}
    <path d="M30 75 Q60 85, 90 75" stroke="#C4704B" strokeWidth="1.5" fill="none" />
    <path d="M28 85 Q60 95, 92 85" stroke="#C4704B" strokeWidth="1.5" fill="none" />
    <path d="M30 95 Q60 105, 90 95" stroke="#C4704B" strokeWidth="1.5" fill="none" />

    {/* Vertical weave */}
    <line x1="40" y1="65" x2="38" y2="108" stroke="#C4704B" strokeWidth="1" />
    <line x1="55" y1="65" x2="55" y2="112" stroke="#C4704B" strokeWidth="1" />
    <line x1="70" y1="65" x2="70" y2="112" stroke="#C4704B" strokeWidth="1" />
    <line x1="82" y1="65" x2="84" y2="108" stroke="#C4704B" strokeWidth="1" />

    {/* Basket rim */}
    <ellipse cx="60" cy="65" rx="35" ry="8" fill="#C4704B" />
    <ellipse cx="60" cy="65" rx="30" ry="6" fill="#D98B6A" />

    {/* Handle */}
    <path d="M35 65 Q35 30, 60 25 Q85 30, 85 65" stroke="#C4704B" strokeWidth="4" fill="none" strokeLinecap="round" />

    {/* Empty indicator - floating items outline */}
    <circle cx="50" cy="50" r="8" stroke="#E5DBC8" strokeWidth="2" fill="none" strokeDasharray="4 2" />
    <circle cx="70" cy="45" r="6" stroke="#E5DBC8" strokeWidth="2" fill="none" strokeDasharray="4 2" />
  </svg>
);

const HeartEmptyIllustration = () => (
  <svg width="120" height="140" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Heart outline */}
    <path
      d="M60 120 C20 85, 10 50, 35 35 C50 25, 60 35, 60 50 C60 35, 70 25, 85 35 C110 50, 100 85, 60 120"
      fill="none"
      stroke="#E5DBC8"
      strokeWidth="4"
      strokeDasharray="8 4"
    />

    {/* Small decorative hearts */}
    <path
      d="M25 25 C22 20, 18 22, 18 26 C18 30, 25 35, 25 35 C25 35, 32 30, 32 26 C32 22, 28 20, 25 25"
      fill="#C4704B"
      opacity="0.3"
    />
    <path
      d="M95 30 C93 27, 90 28, 90 31 C90 34, 95 37, 95 37 C95 37, 100 34, 100 31 C100 28, 97 27, 95 30"
      fill="#7D8B6E"
      opacity="0.3"
    />

    {/* Star */}
    <path
      d="M60 60 L62 68 L70 68 L64 73 L66 81 L60 76 L54 81 L56 73 L50 68 L58 68 Z"
      fill="#E8C547"
      opacity="0.5"
    />
  </svg>
);

const ErrorIllustration = () => (
  <svg width="120" height="140" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Cloud */}
    <ellipse cx="60" cy="50" rx="35" ry="25" fill="#F0E9DC" />
    <ellipse cx="40" cy="55" rx="20" ry="15" fill="#F0E9DC" />
    <ellipse cx="80" cy="55" rx="20" ry="15" fill="#F0E9DC" />

    {/* Lightning bolt */}
    <path d="M55 70 L65 70 L58 90 L70 90 L50 120 L55 95 L45 95 Z" fill="#E8C547" />

    {/* Rain drops */}
    <ellipse cx="35" cy="85" rx="2" ry="4" fill="#7D8B6E" opacity="0.5" />
    <ellipse cx="50" cy="95" rx="2" ry="4" fill="#7D8B6E" opacity="0.5" />
    <ellipse cx="75" cy="88" rx="2" ry="4" fill="#7D8B6E" opacity="0.5" />
    <ellipse cx="88" cy="98" rx="2" ry="4" fill="#7D8B6E" opacity="0.5" />
  </svg>
);

const EmptyPantryIllustration = () => (
  <svg width="120" height="140" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Cabinet */}
    <rect x="20" y="25" width="80" height="95" rx="4" fill="#F0E9DC" stroke="#E5DBC8" strokeWidth="2" />

    {/* Cabinet doors */}
    <rect x="24" y="29" width="34" height="87" rx="2" fill="#FBF8F3" stroke="#E5DBC8" strokeWidth="1" />
    <rect x="62" y="29" width="34" height="87" rx="2" fill="#FBF8F3" stroke="#E5DBC8" strokeWidth="1" />

    {/* Door handles */}
    <rect x="52" y="65" width="3" height="12" rx="1.5" fill="#C4704B" />
    <rect x="65" y="65" width="3" height="12" rx="1.5" fill="#C4704B" />

    {/* Empty shelves (dashed) */}
    <line x1="28" y1="50" x2="54" y2="50" stroke="#E5DBC8" strokeWidth="1" strokeDasharray="4 2" />
    <line x1="28" y1="75" x2="54" y2="75" stroke="#E5DBC8" strokeWidth="1" strokeDasharray="4 2" />
    <line x1="28" y1="100" x2="54" y2="100" stroke="#E5DBC8" strokeWidth="1" strokeDasharray="4 2" />
    <line x1="66" y1="50" x2="92" y2="50" stroke="#E5DBC8" strokeWidth="1" strokeDasharray="4 2" />
    <line x1="66" y1="75" x2="92" y2="75" stroke="#E5DBC8" strokeWidth="1" strokeDasharray="4 2" />
    <line x1="66" y1="100" x2="92" y2="100" stroke="#E5DBC8" strokeWidth="1" strokeDasharray="4 2" />

    {/* Package icon outline */}
    <rect x="45" y="55" width="30" height="25" rx="3" stroke="#C4704B" strokeWidth="2" strokeDasharray="4 2" fill="none" opacity="0.4" />
    <line x1="45" y1="65" x2="75" y2="65" stroke="#C4704B" strokeWidth="1" strokeDasharray="4 2" opacity="0.4" />
    <line x1="60" y1="55" x2="60" y2="65" stroke="#C4704B" strokeWidth="1" strokeDasharray="4 2" opacity="0.4" />

    {/* Plus sign */}
    <circle cx="100" cy="25" r="12" fill="#7D8B6E" opacity="0.2" />
    <line x1="95" y1="25" x2="105" y2="25" stroke="#7D8B6E" strokeWidth="2" strokeLinecap="round" />
    <line x1="100" y1="20" x2="100" y2="30" stroke="#7D8B6E" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const illustrations = {
  'no-scans': EmptyFridgeIllustration,
  'no-recipes': ChefPuzzledIllustration,
  'no-lists': EmptyBasketIllustration,
  'no-favorites': HeartEmptyIllustration,
  'no-pantry': EmptyPantryIllustration,
  'error': ErrorIllustration,
  'custom': null,
};

const defaultContent = {
  'no-scans': {
    title: "Your fridge is waiting",
    description: "Upload a photo of your fridge to discover what delicious meals you can create with what you have.",
    actionLabel: "Scan Your Fridge",
  },
  'no-recipes': {
    title: "No recipes yet",
    description: "Scan your fridge to get personalized recipe suggestions based on your ingredients.",
    actionLabel: "Get Started",
  },
  'no-lists': {
    title: "No shopping lists",
    description: "Create a shopping list to keep track of ingredients you need to buy.",
    actionLabel: "Create List",
  },
  'no-favorites': {
    title: "No favorites yet",
    description: "Heart recipes you love to save them here for quick access.",
    actionLabel: "Browse Recipes",
  },
  'no-pantry': {
    title: "Your pantry is empty",
    description: "Add ingredients you have on hand to get better recipe suggestions.",
    actionLabel: "Scan to Add",
  },
  'error': {
    title: "Oops! Something went wrong",
    description: "We encountered an unexpected error. Please try again.",
    actionLabel: "Try Again",
  },
  'custom': {
    title: "",
    description: "",
    actionLabel: "",
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  const Illustration = illustrations[variant];
  const defaults = defaultContent[variant];

  const displayTitle = title || defaults.title;
  const displayDescription = description || defaults.description;
  const displayActionLabel = actionLabel || defaults.actionLabel;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {Illustration && (
        <div className="mb-6">
          <Illustration />
        </div>
      )}

      <h3 className="text-xl font-semibold text-charcoal mb-2">
        {displayTitle}
      </h3>

      <p className="text-charcoal/70 max-w-sm mb-6">
        {displayDescription}
      </p>

      {onAction && displayActionLabel && (
        <div>
          <Button variant="primary" onClick={onAction}>
            {displayActionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
