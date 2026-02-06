'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  variant?: 'default' | 'glass' | 'elevated' | 'outline';
  compact?: boolean;
  header?: React.ReactNode;
  headerIcon?: React.ReactNode;
  style?: React.CSSProperties;
  shine?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hover = false,
  variant = 'default',
  compact = false,
  header,
  headerIcon,
  style,
  shine = false,
}) => {
  const variantStyles = {
    default: 'bg-cream border border-cream-darker shadow-soft',
    glass: 'glass-card',
    elevated: 'bg-cream shadow-medium',
    outline: 'bg-transparent border-2 border-cream-darker',
  };

  const paddingStyles = compact ? 'p-4' : 'p-5';

  const hoverStyles = hover
    ? `
      hover:shadow-medium hover:-translate-y-1 cursor-pointer
      active:translate-y-0 active:shadow-soft active:scale-[0.98]
      hover:border-terracotta/20
      transition-all duration-200
    `
    : 'transition-all duration-200';

  const interactiveStyles = onClick
    ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2 focus:ring-offset-cream-lightest'
    : '';

  const shineStyles = shine ? 'card-shine' : '';

  return (
    <div
      className={`
        rounded-2xl
        ${variantStyles[variant]}
        ${paddingStyles}
        ${hoverStyles}
        ${interactiveStyles}
        ${shineStyles}
        ${className}
      `}
      onClick={onClick}
      style={style}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {(header || headerIcon) && (
        <div className="flex items-center gap-3 mb-4">
          {headerIcon && (
            <div className="text-terracotta transition-transform duration-200 group-hover:scale-110">
              {headerIcon}
            </div>
          )}
          {header && (
            <div className="font-semibold text-charcoal">{header}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

// Card subcomponents for consistent structure
export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-charcoal ${className}`}>{children}</h3>
);

export const CardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <p className={`text-sm text-charcoal/70 ${className}`}>{children}</p>
);

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-charcoal/10 ${className}`}>{children}</div>
);

// Interactive card with built-in hover animations
export const InteractiveCard: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = '' }) => (
  <Card
    hover
    shine
    onClick={onClick}
    className={`group interactive-layer ${className}`}
  >
    {children}
  </Card>
);
