'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Route-aware animation variants
const getAnimationVariant = (pathname: string) => {
  if (pathname.includes('/scan')) {
    return 'slide-left'; // Camera pages slide from left
  }
  if (pathname.includes('/recipes')) {
    return 'scale-up'; // Recipe pages scale up
  }
  if (pathname.includes('/settings')) {
    return 'fade'; // Settings just fade
  }
  return 'slide-up'; // Default: slide up like rising steam
};

export default function Template({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const pathname = usePathname();
  const variant = getAnimationVariant(pathname);

  useEffect(() => {
    // Reset states on route change
    setIsExiting(false);
    setMounted(false);

    // Small delay for mounting animation
    const timer = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      cancelAnimationFrame(timer);
    };
  }, [pathname]);

  const animationClasses = {
    'slide-up': mounted
      ? 'opacity-100 translate-y-0 scale-100'
      : 'opacity-0 translate-y-5 scale-[0.98]',
    'slide-left': mounted
      ? 'opacity-100 translate-x-0'
      : 'opacity-0 -translate-x-5',
    'scale-up': mounted
      ? 'opacity-100 scale-100'
      : 'opacity-0 scale-95',
    'fade': mounted
      ? 'opacity-100'
      : 'opacity-0',
  };

  return (
    <div
      className={`
        transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        will-change-transform
        ${animationClasses[variant]}
        ${isExiting ? 'opacity-0 -translate-y-2 scale-[0.98]' : ''}
      `}
    >
      {children}
    </div>
  );
}
