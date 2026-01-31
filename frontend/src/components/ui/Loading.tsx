'use client';

import React, { useState, useEffect } from 'react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'cooking-pot' | 'dots';
}

// Random cooking messages
const cookingMessages = [
  "Preheating the oven...",
  "Stirring the pot...",
  "Chopping ingredients...",
  "Simmering flavors...",
  "Whisking up magic...",
  "Seasoning to perfection...",
  "Letting it marinate...",
  "Checking the recipe...",
  "Gathering ingredients...",
  "Taste testing...",
];

export const Loading: React.FC<LoadingProps> = ({
  message,
  size = 'md',
  variant = 'cooking-pot',
}) => {
  const [currentMessage, setCurrentMessage] = useState(message || cookingMessages[0]);

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      return;
    }

    // Rotate through cooking messages
    const interval = setInterval(() => {
      setCurrentMessage(cookingMessages[Math.floor(Math.random() * cookingMessages.length)]);
    }, 2000);

    return () => clearInterval(interval);
  }, [message]);

  const sizeStyles = {
    sm: { pot: 'w-12 h-12', text: 'text-sm' },
    md: { pot: 'w-20 h-20', text: 'text-base' },
    lg: { pot: 'w-28 h-28', text: 'text-lg' },
  };

  // Animated cooking pot with steam
  const CookingPot = () => (
    <div className={`relative ${sizeStyles[size].pot}`}>
      {/* Steam particles */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1">
        <div className="w-2 h-2 bg-terracotta/30 rounded-full animate-steam-1" />
        <div className="w-1.5 h-1.5 bg-terracotta/20 rounded-full animate-steam-2" />
        <div className="w-2 h-2 bg-terracotta/30 rounded-full animate-steam-3" />
      </div>

      {/* Pot SVG */}
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Pot handles */}
        <path
          d="M8 28 C4 28, 4 36, 8 36"
          stroke="#A85938"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M56 28 C60 28, 60 36, 56 36"
          stroke="#A85938"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Pot body */}
        <rect x="10" y="24" width="44" height="32" rx="4" fill="#C4704B" />

        {/* Pot inner */}
        <rect x="14" y="28" width="36" height="24" rx="2" fill="#D98B6A" />

        {/* Liquid surface with bubble animation */}
        <ellipse cx="32" cy="30" rx="16" ry="3" fill="#7D8B6E" className="animate-pulse">
          <animate attributeName="ry" values="3;4;3" dur="1s" repeatCount="indefinite" />
        </ellipse>

        {/* Bubbles */}
        <circle cx="26" cy="36" r="2" fill="#A0AE91" opacity="0.6">
          <animate attributeName="cy" values="36;28;36" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="38" cy="38" r="1.5" fill="#A0AE91" opacity="0.4">
          <animate attributeName="cy" values="38;30;38" dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="32" cy="40" r="2.5" fill="#A0AE91" opacity="0.5">
          <animate attributeName="cy" values="40;28;40" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="1.8s" repeatCount="indefinite" />
        </circle>

        {/* Pot lid */}
        <rect x="8" y="20" width="48" height="6" rx="3" fill="#A85938" />

        {/* Lid knob */}
        <circle cx="32" cy="18" r="4" fill="#C4704B" />
        <circle cx="32" cy="18" r="2" fill="#A85938" />
      </svg>
    </div>
  );

  // Simple spinner
  const Spinner = () => (
    <svg
      className={`animate-spin text-terracotta ${sizeStyles[size].pot}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Animated dots
  const Dots = () => (
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 bg-terracotta rounded-full animate-bounce-dot" />
      <span className="w-3 h-3 bg-terracotta rounded-full animate-bounce-dot-delay-1" />
      <span className="w-3 h-3 bg-terracotta rounded-full animate-bounce-dot-delay-2" />
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return <Spinner />;
      case 'dots':
        return <Dots />;
      case 'cooking-pot':
      default:
        return <CookingPot />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div>
        {renderLoader()}
      </div>
      <p
        className={`
          mt-4 text-charcoal/60 ${sizeStyles[size].text}
        `}
        key={currentMessage}
      >
        {currentMessage}
      </p>
    </div>
  );
};

// Mini loading indicator for inline use
export const LoadingDots: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`inline-flex items-center gap-1 ${className}`}>
    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce-dot" />
    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce-dot-delay-1" />
    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce-dot-delay-2" />
  </span>
);
