'use client';

import React, { useState, useCallback } from 'react';
import { Heart } from '@phosphor-icons/react';

// Animated heart for favorites
interface AnimatedHeartProps {
  isFavorited: boolean;
  onToggle: () => void;
  size?: number;
  className?: string;
}

export const AnimatedHeart: React.FC<AnimatedHeartProps> = ({
  isFavorited,
  onToggle,
  size = 24,
  className = '',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const handleClick = useCallback(() => {
    if (!isFavorited) {
      // Trigger animation when favoriting
      setIsAnimating(true);
      setShowParticles(true);
      setTimeout(() => setIsAnimating(false), 400);
      setTimeout(() => setShowParticles(false), 600);
    }
    onToggle();
  }, [isFavorited, onToggle]);

  return (
    <button
      onClick={handleClick}
      className={`
        relative inline-flex items-center justify-center
        p-2 -m-2 rounded-full
        transition-colors duration-200
        hover:bg-terracotta/10
        focus:outline-none focus:ring-2 focus:ring-terracotta/50
        ${className}
      `}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {/* Particle burst effect */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-terracotta animate-particle-burst"
              style={{
                transform: `rotate(${i * 60}deg) translateY(-12px)`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Heart icon */}
      <Heart
        size={size}
        weight={isFavorited ? 'fill' : 'regular'}
        className={`
          transition-all duration-200
          ${isFavorited ? 'text-terracotta' : 'text-charcoal/40 hover:text-terracotta/60'}
          ${isAnimating ? 'animate-heart-pop' : ''}
        `}
      />
    </button>
  );
};

// Ripple effect button wrapper
interface RippleWrapperProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const RippleWrapper: React.FC<RippleWrapperProps> = ({
  children,
  className = '',
  onClick,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    onClick?.();
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

// Pulse effect for notifications
interface PulseIndicatorProps {
  isActive?: boolean;
  color?: 'terracotta' | 'sage' | 'butter';
  size?: 'sm' | 'md' | 'lg';
}

export const PulseIndicator: React.FC<PulseIndicatorProps> = ({
  isActive = true,
  color = 'terracotta',
  size = 'md',
}) => {
  if (!isActive) return null;

  const colors = {
    terracotta: 'bg-terracotta',
    sage: 'bg-sage',
    butter: 'bg-butter',
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span className="relative flex">
      <span
        className={`
          absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping
          ${colors[color]}
        `}
      />
      <span
        className={`
          relative inline-flex rounded-full
          ${colors[color]} ${sizes[size]}
        `}
      />
    </span>
  );
};

// Skeleton loading animation
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
}) => {
  const baseClasses = 'shimmer';
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        width: width ?? (variant === 'circular' ? 40 : '100%'),
        height: height ?? (variant === 'text' ? 16 : variant === 'circular' ? 40 : 100),
      }}
    />
  );
};

// Counter animation
interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  className = '',
}) => {
  return (
    <span
      key={value}
      className={`inline-block animate-spring-scale ${className}`}
    >
      {value}
    </span>
  );
};

export default AnimatedHeart;
