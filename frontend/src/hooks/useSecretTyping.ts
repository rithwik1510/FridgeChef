'use client';

import { useEffect, useCallback, useRef } from 'react';

// Secret words and their effects
export const SECRET_WORDS = {
  ratatouille: { emoji: '🐀', message: 'Anyone can cook!' },
  gordon: { emoji: '🔥', message: "It's RAW!" },
  julia: { emoji: '🍷', message: 'Bon appétit!' },
  yummy: { emoji: '😋', message: 'Delicious choice!' },
  chef: { emoji: '👨‍🍳', message: 'At your service!' },
  recipe: { emoji: '📖', message: 'Let me find something tasty!' },
  hungry: { emoji: '🍽️', message: "Let's cook something!" },
} as const;

export type SecretWord = keyof typeof SECRET_WORDS;

interface UseSecretTypingOptions {
  onSecretFound?: (word: SecretWord, effect: { emoji: string; message: string }) => void;
  timeout?: number;
}

export const useSecretTyping = (options: UseSecretTypingOptions = {}) => {
  const { onSecretFound, timeout = 2000 } = options;
  const typedChars = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTyping = useCallback(() => {
    typedChars.current = '';
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const checkForSecretWord = useCallback(() => {
    const typed = typedChars.current.toLowerCase();

    for (const [word, effect] of Object.entries(SECRET_WORDS)) {
      if (typed.endsWith(word)) {
        onSecretFound?.(word as SecretWord, effect);
        resetTyping();
        return true;
      }
    }
    return false;
  }, [onSecretFound, resetTyping]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Only accept letter keys
      if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
        typedChars.current += event.key;

        // Limit buffer size
        if (typedChars.current.length > 20) {
          typedChars.current = typedChars.current.slice(-20);
        }

        // Reset timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(resetTyping, timeout);

        // Check for secret words
        checkForSecretWord();
      }
    },
    [timeout, resetTyping, checkForSecretWord]
  );

  useEffect(() => {
    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleKeyPress]);

  return { resetTyping };
};

export default useSecretTyping;
