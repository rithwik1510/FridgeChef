import React from 'react';

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
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-xl
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cream-lightest
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.98]
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

  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-5 w-5"
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

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${glowStyles}
        ${widthStyles}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          <span>Loading...</span>
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
  ...props
}) => {
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
      className={`
        inline-flex items-center justify-center rounded-xl
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2
        active:scale-95
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      aria-label={label}
      {...props}
    >
      {icon}
    </button>
  );
};
