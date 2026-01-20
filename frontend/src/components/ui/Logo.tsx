'use client';

import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
  };

  const iconSize = sizes[size].icon;
  const textSize = sizes[size].text;

  const LogoIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform duration-300 group-hover:scale-105"
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

  if (variant === 'icon') {
    return (
      <div className={`group inline-flex items-center ${className}`}>
        <LogoIcon />
      </div>
    );
  }

  return (
    <div className={`group inline-flex items-center gap-2 ${className}`}>
      <LogoIcon />
      <span className={`font-fraunces font-bold ${textSize}`}>
        <span className="text-charcoal">Fridge</span>
        <span className="text-terracotta">Chef</span>
      </span>
    </div>
  );
};
