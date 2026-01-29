'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInViewOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useInView = (options: UseInViewOptions = {}) => {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  const setRef = useCallback((node: HTMLElement | null) => {
    ref.current = node;
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Don't observe if already triggered and triggerOnce is true
    if (triggerOnce && hasTriggered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setHasTriggered(true);
            if (triggerOnce) {
              observer.disconnect();
            }
          } else if (!triggerOnce) {
            setIsInView(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return { ref: setRef, isInView };
};

// Animation variants for scroll reveal
export type ScrollRevealVariant = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'fade';

const variantClasses: Record<ScrollRevealVariant, { initial: string; animate: string }> = {
  'fade-up': {
    initial: 'opacity-0 translate-y-8',
    animate: 'opacity-100 translate-y-0',
  },
  'fade-down': {
    initial: 'opacity-0 -translate-y-8',
    animate: 'opacity-100 translate-y-0',
  },
  'fade-left': {
    initial: 'opacity-0 translate-x-8',
    animate: 'opacity-100 translate-x-0',
  },
  'fade-right': {
    initial: 'opacity-0 -translate-x-8',
    animate: 'opacity-100 translate-x-0',
  },
  scale: {
    initial: 'opacity-0 scale-95',
    animate: 'opacity-100 scale-100',
  },
  fade: {
    initial: 'opacity-0',
    animate: 'opacity-100',
  },
};

interface UseScrollRevealOptions extends UseInViewOptions {
  variant?: ScrollRevealVariant;
  delay?: number;
  duration?: number;
}

export const useScrollReveal = (options: UseScrollRevealOptions = {}) => {
  const { variant = 'fade-up', delay = 0, duration = 500, ...inViewOptions } = options;
  const { ref, isInView } = useInView(inViewOptions);

  const classes = variantClasses[variant];
  const animationClass = isInView ? classes.animate : classes.initial;

  const style = {
    transitionProperty: 'opacity, transform',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDelay: `${delay}ms`,
  };

  return { ref, isInView, animationClass, style };
};

// React component wrapper for scroll reveal
import React from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: ScrollRevealVariant;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 500,
  threshold = 0.1,
  className = '',
  as: Component = 'div',
}) => {
  const { ref, animationClass, style } = useScrollReveal({
    variant,
    delay,
    duration,
    threshold,
  });

  return React.createElement(
    Component,
    {
      ref,
      className: `${animationClass} ${className}`,
      style,
    },
    children
  );
};

export default useInView;
