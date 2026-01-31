'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, ForkKnife, ShoppingCart, House, Gear } from '@phosphor-icons/react';
import { useIsLandscape, useIsMobile } from '@/hooks/useMediaQuery';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: House },
  { href: '/recipes', label: 'Recipes', icon: ForkKnife },
  { href: '/scan', label: 'Scan', icon: Camera, isCenter: true },
  { href: '/lists', label: 'Lists', icon: ShoppingCart },
  { href: '/settings', label: 'Settings', icon: Gear },
];

export const Navigation = () => {
  const pathname = usePathname();
  const isLandscape = useIsLandscape();
  const isMobile = useIsMobile();
  const isMobileLandscape = isLandscape && isMobile;

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom bg-cream border-t border-charcoal/10">
        <div
          className={`
            flex items-center justify-around h-full
            ${isMobileLandscape ? 'h-14 max-w-lg mx-auto' : 'h-16'}
          `}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isCenter = item.isCenter;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center justify-center
                  transition-all duration-200
                  ${isMobileLandscape
                    ? 'flex-row gap-1.5 px-2 py-1.5'
                    : 'flex-col py-2 px-3 min-w-[60px]'
                  }
                  ${isCenter
                    ? ''
                    : active
                      ? 'text-terracotta'
                      : 'text-charcoal/50 hover:text-charcoal active:text-terracotta'
                  }
                `}
              >
                {/* Fixed height icon container for alignment */}
                <div className={`
                  flex items-center justify-center
                  ${isMobileLandscape ? 'w-[18px] h-[18px]' : 'w-[22px] h-[22px]'}
                `}>
                  {isCenter ? (
                    /* Center Scan button with terracotta circle */
                    <div
                      className={`
                        flex items-center justify-center
                        rounded-full bg-terracotta text-cream
                        transition-all duration-200
                        active:scale-95
                        ${isMobileLandscape ? 'w-9 h-9' : 'w-10 h-10'}
                        ${active ? 'shadow-glow' : 'hover:shadow-glow'}
                      `}
                    >
                      <Icon
                        size={isMobileLandscape ? 16 : 20}
                        weight={active ? 'fill' : 'bold'}
                      />
                    </div>
                  ) : (
                    <Icon
                      size={isMobileLandscape ? 18 : 22}
                      weight={active ? 'fill' : 'regular'}
                    />
                  )}
                </div>
                <span
                  className={`
                    ${isMobileLandscape ? 'text-xs' : 'text-[10px]'}
                    ${isCenter
                      ? active
                        ? 'text-terracotta font-semibold'
                        : 'text-charcoal/50 font-medium'
                      : active
                        ? 'font-semibold'
                        : 'font-medium'
                    }
                  `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Tablet Horizontal Navigation */}
      <nav className="hidden md:flex lg:hidden bg-cream-dark border-b border-charcoal/10">
        <div className="w-full px-4">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const isScan = item.isCenter;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-3 whitespace-nowrap
                    transition-all duration-200 border-b-2
                    ${isScan
                      ? active
                        ? 'text-cream bg-terracotta border-terracotta font-medium rounded-t-lg'
                        : 'text-terracotta border-transparent hover:bg-terracotta/10'
                      : active
                        ? 'text-terracotta border-terracotta font-medium'
                        : 'text-charcoal/60 border-transparent hover:text-terracotta hover:border-terracotta/30'
                    }
                  `}
                >
                  <Icon size={20} weight={active ? 'fill' : 'regular'} />
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
