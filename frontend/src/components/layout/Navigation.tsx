'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, ForkKnife, ShoppingCart, House, Gear } from '@phosphor-icons/react';
import { useIsLandscape, useIsMobile } from '@/hooks/useMediaQuery';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: House },
  { href: '/scan', label: 'Scan', icon: Camera },
  { href: '/recipes', label: 'Recipes', icon: ForkKnife },
  { href: '/lists', label: 'Lists', icon: ShoppingCart },
];

export const Navigation = () => {
  const pathname = usePathname();
  const isLandscape = useIsLandscape();
  const isMobile = useIsMobile();
  const isMobileLandscape = isLandscape && isMobile;

  return (
    <>
      {/* Mobile Bottom Navigation - Only shown on mobile/tablet */}
      <nav className={`
        lg:hidden fixed bottom-0 left-0 right-0
        bg-cream border-t border-charcoal/10 shadow-medium z-40
        ${isMobileLandscape ? 'h-12' : 'h-16'}
        safe-bottom
      `}>
        <div className={`flex justify-around items-center h-full px-2
                         ${isMobileLandscape ? 'max-w-md mx-auto' : ''}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center justify-center
                  py-2 px-3 rounded-xl
                  transition-all duration-200
                  ${isMobileLandscape ? 'flex-row gap-2 min-h-[40px]' : 'flex-col min-h-[44px] min-w-[64px]'}
                  ${
                    isActive
                      ? 'text-terracotta'
                      : 'text-charcoal/50 hover:text-charcoal active:bg-cream-dark'
                  }
                `}
              >
                <Icon
                  size={isMobileLandscape ? 20 : 24}
                  weight={isActive ? 'fill' : 'regular'}
                  className={`${!isMobileLandscape ? 'mb-1' : ''} ${isActive ? 'animate-bounce-subtle' : ''}`}
                />
                <span className={`
                    ${isMobileLandscape ? 'text-sm' : 'text-xs'}
                    ${isActive ? 'font-semibold' : 'font-medium'}
                `}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Tablet Horizontal Navigation - Shown on tablet but not desktop */}
      <nav className="hidden md:flex lg:hidden bg-cream-dark border-b border-charcoal/10">
        <div className="w-full px-4">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {[...navItems, { href: '/settings', label: 'Settings', icon: Gear }].map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-3 whitespace-nowrap
                    transition-all duration-200 border-b-2
                    ${
                      isActive
                        ? 'text-terracotta border-terracotta font-medium'
                        : 'text-charcoal/60 border-transparent hover:text-terracotta hover:border-terracotta/30'
                    }
                  `}
                >
                  <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};
