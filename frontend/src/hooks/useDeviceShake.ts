'use client';

import { useEffect, useCallback, useRef, useState } from 'react';

interface UseDeviceShakeOptions {
  threshold?: number; // Acceleration threshold to detect shake
  timeout?: number; // Cooldown between shake detections (ms)
  onShake?: () => void;
}

export const useDeviceShake = (options: UseDeviceShakeOptions = {}) => {
  const { threshold = 15, timeout = 1000, onShake } = options;
  const lastShakeTime = useRef<number>(0);
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const handleMotion = useCallback(
    (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const { x, y, z } = acceleration;
      if (x === null || y === null || z === null) return;

      // Calculate total acceleration magnitude
      const totalAcceleration = Math.sqrt(x * x + y * y + z * z);

      // Detect shake if acceleration exceeds threshold
      // and enough time has passed since last shake
      const now = Date.now();
      if (totalAcceleration > threshold && now - lastShakeTime.current > timeout) {
        lastShakeTime.current = now;
        onShake?.();
      }
    },
    [threshold, timeout, onShake]
  );

  const requestPermission = useCallback(async () => {
    // Check if DeviceMotionEvent is available
    if (typeof DeviceMotionEvent === 'undefined') {
      setIsSupported(false);
      return false;
    }

    // iOS 13+ requires permission
    if (
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        const granted = permission === 'granted';
        setHasPermission(granted);
        return granted;
      } catch (error) {
        console.error('Error requesting device motion permission:', error);
        setHasPermission(false);
        return false;
      }
    }

    // Non-iOS devices don't need permission
    setHasPermission(true);
    return true;
  }, []);

  useEffect(() => {
    // Check if device motion is supported
    const supported = typeof DeviceMotionEvent !== 'undefined';
    setIsSupported(supported);

    if (!supported) return;

    // For non-iOS devices, assume permission is granted
    if (typeof (DeviceMotionEvent as any).requestPermission !== 'function') {
      setHasPermission(true);
    }
  }, []);

  useEffect(() => {
    if (!isSupported || !hasPermission) return;

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isSupported, hasPermission, handleMotion]);

  return {
    isSupported,
    hasPermission,
    requestPermission,
  };
};

// Chef tips for shake easter egg
export const CHEF_TIPS = [
  "Take photos in good lighting for best ingredient detection!",
  "Group similar ingredients together for faster scanning.",
  "Fresh herbs can transform any dish!",
  "Don't forget to check your pantry staples.",
  "Mise en place - prep everything before you start cooking!",
  "Taste as you cook and adjust seasoning.",
  "Let meat rest after cooking for juicier results.",
  "Sharp knives are safer than dull ones!",
  "Room temperature ingredients mix better.",
  "Clean as you go to make cooking more enjoyable!",
];

export const getRandomChefTip = () => {
  return CHEF_TIPS[Math.floor(Math.random() * CHEF_TIPS.length)];
};

export default useDeviceShake;
