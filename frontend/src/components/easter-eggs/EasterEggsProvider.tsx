'use client';

import React, { createContext, useContext, useCallback, useState } from 'react';
import { useKonamiCode } from '@/hooks/useKonamiCode';
import { useSecretTyping, SECRET_WORDS, SecretWord } from '@/hooks/useSecretTyping';
import { useDeviceShake, getRandomChefTip } from '@/hooks/useDeviceShake';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { ChefModeOverlay, useChefMode } from './ChefModeOverlay';
import { Confetti, useConfetti } from './Confetti';
import { SecretMessages } from './SecretMessages';
import { useToast } from '@/components/ui/Toast';

interface EasterEggsContextType {
  triggerChefMode: () => void;
  triggerConfetti: () => void;
  isSoundMuted: boolean;
  toggleSound: () => void;
}

const EasterEggsContext = createContext<EasterEggsContextType | undefined>(undefined);

export const useEasterEggs = () => {
  const context = useContext(EasterEggsContext);
  if (!context) {
    throw new Error('useEasterEggs must be used within an EasterEggsProvider');
  }
  return context;
};

interface EasterEggsProviderProps {
  children: React.ReactNode;
}

export const EasterEggsProvider: React.FC<EasterEggsProviderProps> = ({ children }) => {
  const { addToast } = useToast();
  const { play, isMuted, toggleMute } = useSoundEffect();
  const chefMode = useChefMode();
  const confetti = useConfetti();

  // Konami code handler
  const handleKonamiCode = useCallback(() => {
    play('chefKiss');
    chefMode.activate();
    addToast({
      type: 'success',
      title: 'Chef Mode Activated!',
      message: 'You found the Konami code easter egg!',
      duration: 5000,
    });
  }, [play, chefMode, addToast]);

  // Secret word handler
  const handleSecretWord = useCallback(
    (word: SecretWord, effect: { emoji: string; message: string }) => {
      play('ding');
      addToast({
        type: 'info',
        title: `${effect.emoji} ${effect.message}`,
        message: `Secret word "${word}" discovered!`,
        duration: 3000,
      });
    },
    [play, addToast]
  );

  // Device shake handler
  const handleShake = useCallback(() => {
    const tip = getRandomChefTip();
    addToast({
      type: 'info',
      title: "Chef's Secret Tip!",
      message: tip,
      duration: 4000,
    });
  }, [addToast]);

  // Initialize easter egg hooks
  useKonamiCode({ onUnlock: handleKonamiCode });
  useSecretTyping({ onSecretFound: handleSecretWord });
  useDeviceShake({ onShake: handleShake });

  // Context value
  const triggerChefMode = useCallback(() => {
    play('chefKiss');
    chefMode.activate();
  }, [play, chefMode]);

  const triggerConfetti = useCallback(() => {
    play('successChime');
    confetti.trigger();
  }, [play, confetti]);

  return (
    <EasterEggsContext.Provider
      value={{
        triggerChefMode,
        triggerConfetti,
        isSoundMuted: isMuted,
        toggleSound: toggleMute,
      }}
    >
      {children}

      {/* Easter egg overlays */}
      <ChefModeOverlay
        isActive={chefMode.isActive}
        onComplete={chefMode.deactivate}
      />
      <confetti.Confetti duration={3000} />
      <SecretMessages />
    </EasterEggsContext.Provider>
  );
};

export default EasterEggsProvider;
