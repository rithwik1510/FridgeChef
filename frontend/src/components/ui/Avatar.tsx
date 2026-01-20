'use client';

import React from 'react';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getBackgroundColor = (name?: string): string => {
    if (!name) return 'bg-charcoal/20';

    const colors = [
      'bg-terracotta',
      'bg-sage',
      'bg-butter-dark',
      'bg-terracotta-dark',
      'bg-sage-dark',
    ];

    // Simple hash based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const baseClasses = `
    inline-flex items-center justify-center
    rounded-full font-medium text-cream
    transition-all duration-200
    ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-terracotta hover:ring-offset-2 hover:ring-offset-cream' : ''}
    ${sizes[size]}
    ${className}
  `;

  if (src) {
    return (
      <div
        className={`${baseClasses} overflow-hidden`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
      >
        <img
          src={src}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${getBackgroundColor(name)}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {getInitials(name)}
    </div>
  );
};
