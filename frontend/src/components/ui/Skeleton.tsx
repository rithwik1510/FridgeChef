'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'shimmer' | 'pulse' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'shimmer',
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const animationClasses = {
    shimmer: 'shimmer',
    pulse: 'animate-pulse bg-cream-dark',
    none: 'bg-cream-dark',
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={style}
    />
  );
};

// Pre-built skeleton components for common use cases

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          width={i === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{
  hasImage?: boolean;
  className?: string;
}> = ({ hasImage = true, className = '' }) => {
  return (
    <div className={`bg-cream rounded-2xl p-5 shadow-soft ${className}`}>
      {hasImage && (
        <Skeleton
          variant="rounded"
          height={160}
          className="w-full mb-4"
        />
      )}
      <Skeleton variant="text" height={24} width="70%" className="mb-3" />
      <SkeletonText lines={2} />
      <div className="flex gap-2 mt-4">
        <Skeleton variant="rounded" height={32} width={80} />
        <Skeleton variant="rounded" height={32} width={60} />
      </div>
    </div>
  );
};

export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
}> = ({ size = 'md', withText = false }) => {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  return (
    <div className="flex items-center gap-3">
      <Skeleton
        variant="circular"
        width={sizes[size]}
        height={sizes[size]}
      />
      {withText && (
        <div className="space-y-1">
          <Skeleton variant="text" height={16} width={120} />
          <Skeleton variant="text" height={12} width={80} />
        </div>
      )}
    </div>
  );
};

export const SkeletonList: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 5, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-cream rounded-xl"
        >
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" height={16} width="60%" />
            <Skeleton variant="text" height={12} width="40%" />
          </div>
          <Skeleton variant="rounded" width={80} height={32} />
        </div>
      ))}
    </div>
  );
};
