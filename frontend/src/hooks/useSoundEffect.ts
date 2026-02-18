'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Sound effect paths
export const SOUNDS = {
  chefKiss: '/sounds/chef-kiss.mp3',
  successChime: '/sounds/success-chime.mp3',
  pop: '/sounds/pop.mp3',
  ding: '/sounds/ding.mp3',
} as const;

export type SoundName = keyof typeof SOUNDS;

const STORAGE_KEY = 'fridgechef-sound-muted';

interface UseSoundEffectOptions {
  preload?: boolean;
  volume?: number;
}

export const useSoundEffect = (options: UseSoundEffectOptions = {}) => {
  const { preload = true, volume = 0.5 } = options;
  const [isMuted, setIsMuted] = useState(false);
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Load mute preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setIsMuted(stored === 'true');
      }
    } catch {
      // localStorage not available
    }
  }, []);

  // Preload sounds
  useEffect(() => {
    if (!preload) return;

    Object.values(SOUNDS).forEach((path) => {
      if (!audioCache.current.has(path)) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audio.volume = volume;
        audioCache.current.set(path, audio);
      }
    });
  }, [preload, volume]);

  const play = useCallback(
    (sound: SoundName) => {
      if (isMuted) return;

      const path = SOUNDS[sound];
      let audio = audioCache.current.get(path);

      if (!audio) {
        audio = new Audio(path);
        audio.volume = volume;
        audioCache.current.set(path, audio);
      }

      // Reset and play
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore errors (e.g., user hasn't interacted with page yet)
      });
    },
    [isMuted, volume]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newValue = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(newValue));
      } catch {
        // localStorage not available
      }
      return newValue;
    });
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setIsMuted(muted);
    try {
      localStorage.setItem(STORAGE_KEY, String(muted));
    } catch {
      // localStorage not available
    }
  }, []);

  return {
    play,
    isMuted,
    toggleMute,
    setMuted,
  };
};

// Convenience hooks for specific sounds
export const useChefKissSound = () => {
  const { play, isMuted, toggleMute } = useSoundEffect();
  return {
    playChefKiss: () => play('chefKiss'),
    isMuted,
    toggleMute,
  };
};

export const useSuccessSound = () => {
  const { play } = useSoundEffect();
  return () => play('successChime');
};

export const usePopSound = () => {
  const { play } = useSoundEffect();
  return () => play('pop');
};

export const useDingSound = () => {
  const { play } = useSoundEffect();
  return () => play('ding');
};

export default useSoundEffect;
