'use client';

import React, { useRef, useCallback } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  glow?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  iconLeft,
  iconRight,
  glow = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Ripple effect handler
  const createRipple = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button || disabled || isLoading) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    button.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }, [disabled, isLoading]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(event);
    onClick?.(event);
  };

  const baseStyles = `
    relative overflow-hidden
    inline-flex items-center justify-center font-medium rounded-xl
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cream-lightest
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.98] active:brightness-95
  `;

  const variantStyles = {
    primary: `
      bg-terracotta text-cream
      hover:bg-terracotta-dark hover:shadow-medium
      focus:ring-terracotta
      shadow-soft
    `,
    secondary: `
      bg-sage text-cream
      hover:bg-sage-dark hover:shadow-medium
      focus:ring-sage
      shadow-soft
    `,
    outline: `
      border-2 border-terracotta text-terracotta
      hover:bg-terracotta hover:text-cream
      focus:ring-terracotta
      bg-transparent
    `,
    ghost: `
      text-terracotta
      hover:bg-cream-dark
      focus:ring-terracotta
      bg-transparent
    `,
    danger: `
      bg-red-500 text-white
      hover:bg-red-600 hover:shadow-medium
      focus:ring-red-500
      shadow-soft
    `,
  };

  const sizeStyles = {
    sm: 'px-4 py-2.5 text-sm min-h-[44px] gap-1.5',
    md: 'px-5 py-3 text-base min-h-[48px] gap-2',
    lg: 'px-6 py-3.5 text-lg min-h-[52px] gap-2.5',
  };

  const glowStyles = glow && !disabled ? 'animate-pulse-glow' : '';
  const widthStyles = fullWidth ? 'w-full' : '';

  // Animated loading dots
  const LoadingDots = () => (
    <span className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce-dot" />
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce-dot-delay-1" />
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce-dot-delay-2" />
    </span>
  );

  return (
    <button
      ref={buttonRef}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${glowStyles}
        ${widthStyles}
        ${className}
      `}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingDots />
          <span>Loading</span>
        </>
      ) : (
        <>
          {iconLeft && <span className="flex-shrink-0">{iconLeft}</span>}
          <span>{children}</span>
          {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
        </>
      )}
    </button>
  );
};

// Icon-only button variant
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  label: string; // For accessibility
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  label,
  className = '',
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Ripple effect handler
  const createRipple = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(event);
    onClick?.(event);
  };

  const sizeStyles = {
    sm: 'w-10 h-10',
    md: 'w-11 h-11',
    lg: 'w-12 h-12',
  };

  const variantStyles = {
    primary: 'bg-terracotta text-cream hover:bg-terracotta-dark',
    secondary: 'bg-sage text-cream hover:bg-sage-dark',
    outline: 'border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-cream',
    ghost: 'text-charcoal/70 hover:text-terracotta hover:bg-cream-dark',
  };

  return (
    <button
      ref={buttonRef}
      className={`
        relative overflow-hidden
        inline-flex items-center justify-center rounded-xl
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2
        active:scale-95 active:brightness-95
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      aria-label={label}
      onClick={handleClick}
      {...props}
    >
      {icon}
    </button>
  );
};
