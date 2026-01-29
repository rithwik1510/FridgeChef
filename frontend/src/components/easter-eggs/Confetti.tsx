'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface ConfettiParticle {
  id: number;
  color: string;
  left: number;
  delay: number;
  duration: number;
  rotation: number;
  size: number;
  shape: 'square' | 'circle' | 'triangle';
}

// Brand colors for confetti
const CONFETTI_COLORS = [
  '#C4704B', // terracotta
  '#D98B6A', // terracotta-light
  '#7D8B6E', // sage
  '#A0AE91', // sage-light
  '#E8C547', // butter
  '#F0D570', // butter-light
  '#F0E9DC', // cream-dark
];

interface ConfettiProps {
  isActive: boolean;
  particleCount?: number;
  duration?: number;
  onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({
  isActive,
  particleCount = 50,
  duration = 3000,
  onComplete,
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Generate confetti particles
    const shapes: ConfettiParticle['shape'][] = ['square', 'circle', 'triangle'];
    const newParticles: ConfettiParticle[] = Array.from(
      { length: particleCount },
      (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        rotation: Math.random() * 720 - 360,
        size: 8 + Math.random() * 8,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      })
    );

    setParticles(newParticles);

    // Complete after duration
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, particleCount, duration, onComplete]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: `${particle.left}%`,
            top: '-20px',
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          {particle.shape === 'square' && (
            <div
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                transform: `rotate(${particle.rotation}deg)`,
              }}
            />
          )}
          {particle.shape === 'circle' && (
            <div
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: '50%',
              }}
            />
          )}
          {particle.shape === 'triangle' && (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: `${particle.size / 2}px solid transparent`,
                borderRight: `${particle.size / 2}px solid transparent`,
                borderBottom: `${particle.size}px solid ${particle.color}`,
                transform: `rotate(${particle.rotation}deg)`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Hook to control confetti
export const useConfetti = () => {
  const [isActive, setIsActive] = useState(false);

  const trigger = useCallback(() => {
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    isActive,
    trigger,
    stop,
    Confetti: (props: Omit<ConfettiProps, 'isActive'>) => (
      <Confetti {...props} isActive={isActive} onComplete={stop} />
    ),
  };
};

export default Confetti;
