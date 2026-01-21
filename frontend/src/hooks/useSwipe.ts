'use client';

import { useRef, useEffect } from 'react';

export function useSwipe<T extends HTMLElement>(options: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}) {
  const ref = useRef<T>(null);
  const startX = useRef(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const diff = e.changedTouches[0].clientX - startX.current;
      if (Math.abs(diff) > (options.threshold || 50)) {
        if (diff > 0) options.onSwipeRight?.();
        else options.onSwipeLeft?.();
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [options]);

  return ref;
}
