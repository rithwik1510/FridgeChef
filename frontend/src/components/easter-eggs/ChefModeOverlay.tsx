'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface FoodEmoji {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

const FOOD_EMOJIS = [
  '🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🥗', '🥘', '🍝',
  '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘',
  '🥧', '🍰', '🎂', '🧁', '🍩', '🍪', '🍫', '🍬', '🍭', '🍮',
  '🍯', '🥐', '🥖', '🥨', '🧀', '🥚', '🍳', '🥞', '🧇', '🥓',
  '🥩', '🍗', '🍖', '🌶️', '🥕', '🥦', '🥬', '🥒', '🍆', '🍅',
  '🥑', '🍄', '🧄', '🧅', '🥔', '🌽', '🍠', '🥥', '🍇', '🍈',
  '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑',
  '🍒', '🍓', '🫐', '🥝', '🍅', '🫒', '🥜', '🌰', '🍞', '🥯',
];

interface ChefModeOverlayProps {
  isActive: boolean;
  onComplete?: () => void;
  duration?: number; // Duration in ms
}

export const ChefModeOverlay: React.FC<ChefModeOverlayProps> = ({
  isActive,
  onComplete,
  duration = 10000,
}) => {
  const [particles, setParticles] = useState<FoodEmoji[]>([]);

  // Generate particles when activated
  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Create 50 food emoji particles
    const newParticles: FoodEmoji[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
      left: Math.random() * 100, // % from left
      delay: Math.random() * 2, // seconds delay
      duration: 2 + Math.random() * 3, // 2-5 seconds fall time
      size: 1.5 + Math.random() * 1.5, // 1.5-3rem size
    }));

    setParticles(newParticles);

    // Auto complete after duration
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <div
      className="
        fixed inset-0 z-[100] pointer-events-none overflow-hidden
        bg-charcoal/10 backdrop-blur-[2px]
      "
      aria-hidden="true"
    >
      {/* Food rain */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-food-rain"
          style={{
            left: `${particle.left}%`,
            top: '-50px',
            fontSize: `${particle.size}rem`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          {particle.emoji}
        </div>
      ))}

      {/* Chef Mode badge */}
      <div
        className="
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          bg-terracotta text-cream
          px-8 py-4 rounded-2xl
          shadow-strong
          animate-spring-scale
          pointer-events-auto
        "
      >
        <div className="text-center">
          <div className="text-4xl mb-2">👨‍🍳</div>
          <h2 className="font-fraunces text-2xl font-bold">Chef Mode Activated!</h2>
          <p className="text-cream/80 mt-1">Konami code unlocked</p>
        </div>
      </div>
    </div>
  );
};

// Hook to use chef mode
export const useChefMode = () => {
  const [isActive, setIsActive] = useState(false);

  const activate = () => setIsActive(true);
  const deactivate = () => setIsActive(false);

  return {
    isActive,
    activate,
    deactivate,
  };
};

export default ChefModeOverlay;
