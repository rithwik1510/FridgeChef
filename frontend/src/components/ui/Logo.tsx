'use client';

import React, { useState, useRef, useCallback } from 'react';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onSecretUnlock?: () => void;
}

const SECRET_CLICK_COUNT = 7;
const SECRET_CLICK_TIMEOUT = 2000; // 2 seconds to complete the sequence

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  onSecretUnlock,
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 42, text: 'text-2xl' },
    lg: { icon: 52, text: 'text-3xl' },
  };

  const iconSize = sizes[size].icon;
  const textSize = sizes[size].text;

  const handleClick = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Add wiggle on each click
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 300);

    if (newCount >= SECRET_CLICK_COUNT) {
      // Easter egg unlocked!
      setShowSecret(true);
      setClickCount(0);
      onSecretUnlock?.();

      // Hide secret message after 3 seconds
      setTimeout(() => {
        setShowSecret(false);
      }, 3000);
    } else {
      // Reset count after timeout
      timeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, SECRET_CLICK_TIMEOUT);
    }
  }, [clickCount, onSecretUnlock]);

  const LogoIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`
        transition-transform duration-300
        group-hover:scale-105
        ${isWiggling ? 'animate-wiggle' : ''}
      `}
    >
      {/* Chef's Hat */}
      <g className="transition-transform duration-300 origin-bottom group-hover:-translate-y-1">
        {/* Hat puff top */}
        <ellipse cx="24" cy="8" rx="8" ry="4" fill="#A0AE91" />
        <ellipse cx="20" cy="9" rx="5" ry="3" fill="#7D8B6E" />
        <ellipse cx="28" cy="9" rx="5" ry="3" fill="#7D8B6E" />
        <ellipse cx="24" cy="7" rx="6" ry="3" fill="#A0AE91" />
        {/* Hat band */}
        <rect x="17" y="10" width="14" height="4" rx="1" fill="#7D8B6E" />
      </g>

      {/* Fridge Body */}
      <rect x="12" y="14" width="24" height="32" rx="3" fill="#C4704B" />

      {/* Fridge Inner Panel */}
      <rect x="14" y="16" width="20" height="28" rx="2" fill="#D98B6A" />

      {/* Freezer compartment */}
      <rect x="16" y="18" width="16" height="8" rx="1" fill="#F0E9DC" />

      {/* Main compartment */}
      <rect x="16" y="28" width="16" height="14" rx="1" fill="#F0E9DC" />

      {/* Fridge Handle */}
      <rect x="33" y="22" width="2" height="6" rx="1" fill="#A85938" />
      <rect x="33" y="32" width="2" height="6" rx="1" fill="#A85938" />

      {/* Freezer divider line */}
      <line x1="16" y1="26.5" x2="32" y2="26.5" stroke="#E5DBC8" strokeWidth="1" />

      {/* Food items silhouettes */}
      <circle cx="20" cy="22" r="2" fill="#7D8B6E" opacity="0.6" />
      <circle cx="26" cy="22" r="1.5" fill="#E8C547" opacity="0.6" />

      <rect x="18" y="31" width="3" height="5" rx="0.5" fill="#7D8B6E" opacity="0.5" />
      <rect x="22" y="32" width="2" height="4" rx="0.5" fill="#C4704B" opacity="0.5" />
      <circle cx="28" cy="34" r="2.5" fill="#E8C547" opacity="0.5" />
    </svg>
  );

  // Progress indicator for clicks
  const ClickProgress = () => {
    if (clickCount === 0) return null;

    return (
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
        {Array.from({ length: SECRET_CLICK_COUNT }).map((_, i) => (
          <div
            key={i}
            className={`
              w-1 h-1 rounded-full transition-all duration-150
              ${i < clickCount ? 'bg-terracotta scale-125' : 'bg-charcoal/20'}
            `}
          />
        ))}
      </div>
    );
  };

  // Secret message overlay
  const SecretMessage = () => {
    if (!showSecret) return null;

    return (
      <div className="
        absolute -bottom-10 left-1/2 -translate-x-1/2
        whitespace-nowrap
        bg-terracotta text-cream px-3 py-1.5 rounded-lg
        text-sm font-medium
        animate-spring-scale
        shadow-medium
      ">
        You found the secret chef! 👨‍🍳✨
      </div>
    );
  };

  if (variant === 'icon') {
    return (
      <div
        className={`group inline-flex items-center relative cursor-pointer select-none ${className}`}
        onClick={handleClick}
      >
        <LogoIcon />
        <ClickProgress />
        <SecretMessage />
      </div>
    );
  }

  return (
    <div
      className={`group inline-flex items-center gap-2 relative cursor-pointer select-none ${className}`}
      onClick={handleClick}
    >
      <LogoIcon />
      <span className={`font-fraunces font-bold ${textSize}`}>
        <span className="text-charcoal">Fridge</span>
        <span className="text-terracotta">Chef</span>
      </span>
      <ClickProgress />
      <SecretMessage />
    </div>
  );
};
