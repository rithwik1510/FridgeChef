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
            : 'flex-col py-2 px-3 min-w-[60px]'
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom">
        {/* The actual nav bar */}
        <nav
          className={`
            bg-cream border-t border-charcoal/10
            ${isMobileLandscape ? 'h-14' : 'h-16'}
          `}
        >
          <div className={`
            flex items-center justify-between h-full px-2
            ${isMobileLandscape ? 'max-w-lg mx-auto' : ''}
          `}>
            {/* Left nav items */}
            <div className="flex items-center justify-evenly flex-1">
              {leftNavItems.map((item) => (
                <NavItem key={item.href} item={item} compact={isMobileLandscape} />
              ))}
            </div>

            {/* Center - Scan label (aligned with other labels) */}
            <Link
              href={scanItem.href}
              className={`
                flex items-center justify-center
                ${isMobileLandscape
                  ? 'flex-row gap-1.5 px-2 py-1.5'
                  : 'flex-col py-2 px-3 min-w-[60px]'
                }
              `}
            >
              {/* Invisible spacer matching icon size */}
              <div className={isMobileLandscape ? 'w-[18px] h-[18px]' : 'w-[22px] h-[22px]'} />
              <span className={`
                ${isMobileLandscape ? 'text-xs' : 'text-[10px]'}
                ${isScanActive ? 'text-terracotta font-semibold' : 'text-charcoal/50 font-medium'}
              `}>
                Scan
              </span>
            </Link>

            {/* Right nav items */}
            <div className="flex items-center justify-evenly flex-1">
              {rightNavItems.map((item) => (
                <NavItem key={item.href} item={item} compact={isMobileLandscape} />
              ))}
            </div>
          </div>
        </nav>

        {/* Floating Scan Button Circle - positioned above the label */}
        <Link
          href={scanItem.href}
          className={`
            lg:hidden fixed left-1/2 -translate-x-1/2 z-50
            ${isMobileLandscape ? 'bottom-[26px]' : 'bottom-[30px]'}
          `}
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div
            className={`
              flex items-center justify-center
              w-14 h-14 rounded-full
              bg-terracotta text-cream
              shadow-medium
              transition-all duration-200 ease-out
              active:scale-95
              ${isScanActive
                ? 'shadow-glow'
                : 'hover:shadow-glow hover:scale-105'
              }
            `}
          >
            <Camera
              size={26}
              weight={isScanActive ? 'fill' : 'bold'}
            />
          </div>
        </Link>
      </div>

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
