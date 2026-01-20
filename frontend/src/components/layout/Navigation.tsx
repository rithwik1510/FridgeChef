'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, ForkKnife, ShoppingCart, House, Gear } from '@phosphor-icons/react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: House },
  { href: '/scan', label: 'Scan', icon: Camera },
  { href: '/recipes', label: 'Recipes', icon: ForkKnife },
  { href: '/lists', label: 'Lists', icon: ShoppingCart },
];

export const Navigation = () => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Bottom Navigation - Only shown on mobile/tablet */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-cream border-t border-charcoal/10 shadow-medium z-40">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center
                  py-2 px-3 rounded-xl min-w-[64px]
                  transition-all duration-200
                  ${
                    isActive
                      ? 'text-terracotta'
                      : 'text-charcoal/50 hover:text-charcoal active:bg-cream-dark'
                  }
                `}
              >
                <Icon
                  size={24}
                  weight={isActive ? 'fill' : 'regular'}
                  className={`mb-1 ${isActive ? 'animate-bounce-subtle' : ''}`}
                />
                <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
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
