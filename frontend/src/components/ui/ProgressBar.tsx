'use client';

import React from 'react';
import { MagnifyingGlass, Carrot, ChefHat, ForkKnife } from '@phosphor-icons/react';

interface ProgressBarProps {
  value: number; // 0-100
  variant?: 'default' | 'gradient' | 'striped';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantStyles = {
    default: 'bg-terracotta',
    gradient: 'gradient-progress',
    striped: 'bg-terracotta bg-striped',
  };

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-charcoal/70">{label}</span>
          {showLabel && (
            <span className="text-sm font-medium text-charcoal">{Math.round(clampedValue)}%</span>
          )}
        </div>
      )}

      <div className={`w-full bg-cream-darker rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`
            ${sizeStyles[size]}
            ${variantStyles[variant]}
            rounded-full
            transition-all duration-500 ease-out
            ${animated ? 'animate-pulse-glow' : ''}
          `}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

// Cooking-themed progress indicator
interface CookingProgressProps {
  stage: 'detecting' | 'analyzing' | 'generating' | 'complete';
  className?: string;
}

const stageConfig = {
  detecting: {
    progress: 25,
    message: 'Peeking inside your fridge...',
    Icon: MagnifyingGlass,
    color: 'text-terracotta',
    bgColor: 'bg-terracotta/10',
  },
  analyzing: {
    progress: 50,
    message: 'Identifying ingredients...',
    Icon: Carrot,
    color: 'text-terracotta',
    bgColor: 'bg-terracotta/10',
  },
  generating: {
    progress: 75,
    message: 'Cooking up recipe ideas...',
    Icon: ChefHat,
    color: 'text-sage',
    bgColor: 'bg-sage/10',
  },
  complete: {
    progress: 100,
    message: 'Recipes ready!',
    Icon: ForkKnife,
    color: 'text-sage',
    bgColor: 'bg-sage/10',
  },
};

export const CookingProgress: React.FC<CookingProgressProps> = ({
  stage,
  className = '',
}) => {
  const { progress, message, Icon, color, bgColor } = stageConfig[stage];

  return (
    <div className={`text-center ${className}`}>
      <div className={`w-16 h-16 ${bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-subtle`}>
        <Icon size={32} className={color} weight="duotone" />
      </div>
      <p className="text-lg text-charcoal/80 mb-4">{message}</p>
      <ProgressBar value={progress} variant="gradient" size="md" />
    </div>
  );
};

// Multi-step progress indicator
interface StepProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  className = '',
}) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-medium text-sm transition-all duration-300
                  ${
                    index < currentStep
                      ? 'bg-sage text-cream'
                      : index === currentStep
                      ? 'bg-terracotta text-cream animate-pulse-glow'
                      : 'bg-cream-darker text-charcoal/50'
                  }
                `}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span
                className={`
                  text-xs mt-2 text-center max-w-[80px]
                  ${index <= currentStep ? 'text-charcoal' : 'text-charcoal/50'}
                `}
              >
                {step}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 mx-2">
                <div className="h-1 bg-cream-darker rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      index < currentStep ? 'bg-sage w-full' : 'bg-transparent w-0'
                    }`}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
