'use client';

import { useEffect, useCallback, useRef } from 'react';

// Konami Code: ↑↑↓↓←→←→BA
const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

interface UseKonamiCodeOptions {
  onUnlock?: () => void;
  timeout?: number; // Time to complete the sequence (ms)
}

export const useKonamiCode = (options: UseKonamiCodeOptions = {}) => {
  const { onUnlock, timeout = 5000 } = options;
  const inputSequence = useRef<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetSequence = useCallback(() => {
    inputSequence.current = [];
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = event.code;
      inputSequence.current.push(key);

      // Start/reset timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(resetSequence, timeout);

      // Check if sequence matches
      const currentIndex = inputSequence.current.length - 1;
      const expectedKey = KONAMI_CODE[currentIndex];

      if (key !== expectedKey) {
        // Wrong key - check if it's the start of a new sequence
        if (key === KONAMI_CODE[0]) {
          inputSequence.current = [key];
        } else {
          resetSequence();
        }
        return;
      }

      // Check if complete
      if (inputSequence.current.length === KONAMI_CODE.length) {
        onUnlock?.();
        resetSequence();
      }
    },
    [onUnlock, timeout, resetSequence]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleKeyDown]);

  return { resetSequence };
};

export default useKonamiCode;
