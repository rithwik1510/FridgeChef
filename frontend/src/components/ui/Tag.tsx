import React from 'react';

interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md';
  className?: string;
  onRemove?: () => void;
  style?: React.CSSProperties;
}

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  onRemove,
  style,
}) => {
  const variantStyles = {
    default: 'bg-sage/10 text-sage-dark border-sage/20',
    success: 'bg-sage/20 text-sage-dark border-sage/30',
    warning: 'bg-butter/20 text-butter-dark border-butter/30',
    info: 'bg-terracotta/10 text-terracotta-dark border-terracotta/20',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[36px]',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1
        border rounded-lg font-medium
        transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      style={style}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:opacity-70 transition-opacity"
          type="button"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};
