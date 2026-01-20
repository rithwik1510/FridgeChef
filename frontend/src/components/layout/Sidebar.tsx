'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, ForkKnife, ShoppingCart, Gear, House } from '@phosphor-icons/react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: House },
  { href: '/scan', label: 'Scan Fridge', icon: Camera },
  { href: '/recipes', label: 'Recipes', icon: ForkKnife },
  { href: '/lists', label: 'Shopping Lists', icon: ShoppingCart },
  { href: '/settings', label: 'Settings', icon: Gear },
];

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const pathname = usePathname();

  return (
    <aside
      className={`
        hidden lg:flex flex-col
        fixed left-0 top-16 bottom-0
        bg-cream-dark border-r border-charcoal/10
        transition-all duration-300 z-40
        ${collapsed ? 'w-16' : 'w-sidebar'}
      `}
    >
      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3 px-3 py-3 rounded-xl
                transition-all duration-200
                animate-fade-in
                ${isActive
                  ? 'bg-terracotta/10 text-terracotta border-l-4 border-terracotta -ml-[4px] pl-[16px]'
                  : 'text-charcoal/70 hover:bg-cream hover:text-charcoal'
                }
              `}
              style={{ animationDelay: `${index * 50}ms` }}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={22}
                weight={isActive ? 'fill' : 'regular'}
                className={`
                  flex-shrink-0 transition-transform duration-200
                  ${!isActive && 'group-hover:scale-110'}
                `}
              />
              {!collapsed && (
                <span className={`font-medium truncate ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-charcoal/10">
        {!collapsed && (
          <div className="text-xs text-charcoal/50 text-center">
            <p>FridgeChef v1.0</p>
          </div>
        )}
      </div>
    </aside>
  );
};
