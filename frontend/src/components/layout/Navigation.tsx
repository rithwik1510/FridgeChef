'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, ForkKnife, ShoppingCart, House, Gear } from '@phosphor-icons/react';
import { useIsLandscape, useIsMobile } from '@/hooks/useMediaQuery';

const leftNavItems = [
  { href: '/dashboard', label: 'Home', icon: House },
  { href: '/recipes', label: 'Recipes', icon: ForkKnife },
];

const rightNavItems = [
  { href: '/lists', label: 'Lists', icon: ShoppingCart },
  { href: '/settings', label: 'Settings', icon: Gear },
];

const scanItem = { href: '/scan', label: 'Scan', icon: Camera };

export const Navigation = () => {
  const pathname = usePathname();
  const isLandscape = useIsLandscape();
  const isMobile = useIsMobile();
  const isMobileLandscape = isLandscape && isMobile;

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));

  const NavItem = ({ item, compact = false }: { item: typeof leftNavItems[0], compact?: boolean }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        href={item.href}
        className={`
          flex items-center justify-center
          transition-all duration-200
          ${compact
            ? 'flex-row gap-1.5 px-2 py-1.5'
            : 'flex-col py-2 px-3 min-w-[56px]'
          }
          ${active
            ? 'text-terracotta'
            : 'text-charcoal/50 hover:text-charcoal active:text-terracotta'
          }
        `}
      >
        <Icon
          size={compact ? 18 : 22}
          weight={active ? 'fill' : 'regular'}
        />
        <span className={`
          ${compact ? 'text-xs' : 'text-[10px]'}
          ${active ? 'font-semibold' : 'font-medium'}
        `}>
          {item.label}
        </span>
      </Link>
    );
  };

  const isScanActive = isActive(scanItem.href);

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className={`
        lg:hidden fixed bottom-0 left-0 right-0
        bg-cream border-t border-charcoal/10 z-40
        ${isMobileLandscape ? 'h-14' : 'h-20'}
        safe-bottom
      `}>
        {/* Curved notch background for scan button */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-20 h-8 bg-cream rounded-t-full" />

        <div className={`
          flex items-end justify-around h-full px-1 pb-1
          ${isMobileLandscape ? 'max-w-lg mx-auto' : ''}
        `}>
          {/* Left nav items */}
          <div className="flex items-center justify-around flex-1">
            {leftNavItems.map((item) => (
              <NavItem key={item.href} item={item} compact={isMobileLandscape} />
            ))}
          </div>

          {/* Center Scan Button - Protruding */}
          <div className="relative flex items-center justify-center -mt-6">
            <Link
              href={scanItem.href}
              className={`
                relative flex items-center justify-center
                w-16 h-16 rounded-full
                bg-terracotta text-cream
                shadow-medium
                transition-all duration-300 ease-out
                active:scale-95
                ${isScanActive
                  ? 'shadow-glow ring-4 ring-terracotta/20'
                  : 'hover:shadow-glow hover:scale-105'
                }
              `}
            >
              {/* Pulse ring animation when active */}
              {isScanActive && (
                <span className="absolute inset-0 rounded-full bg-terracotta/30 animate-ping" />
              )}

              {/* Icon */}
              <Camera
                size={28}
                weight={isScanActive ? 'fill' : 'bold'}
                className="relative z-10"
              />
            </Link>

            {/* Label below */}
            <span className={`
              absolute -bottom-5 left-1/2 -translate-x-1/2
              text-[10px] font-semibold whitespace-nowrap
              ${isScanActive ? 'text-terracotta' : 'text-charcoal/60'}
            `}>
              {scanItem.label}
            </span>
          </div>

          {/* Right nav items */}
          <div className="flex items-center justify-around flex-1">
            {rightNavItems.map((item) => (
              <NavItem key={item.href} item={item} compact={isMobileLandscape} />
            ))}
          </div>
        </div>
      </nav>

      {/* Tablet Horizontal Navigation */}
      <nav className="hidden md:flex lg:hidden bg-cream-dark border-b border-charcoal/10">
        <div className="w-full px-4">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {[...leftNavItems, scanItem, ...rightNavItems].map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const isScan = item.href === '/scan';

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
