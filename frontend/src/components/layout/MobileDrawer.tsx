'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Avatar } from '@/components/ui/Avatar';
import { Logo } from '@/components/ui/Logo';
import { X, Camera, ForkKnife, Package, Gear, House, SignOut } from '@phosphor-icons/react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: House },
  { href: '/scan', label: 'Scan Fridge', icon: Camera },
  { href: '/recipes', label: 'Recipes', icon: ForkKnife },
  { href: '/pantry', label: 'Pantry', icon: Package },
  { href: '/settings', label: 'Settings', icon: Gear },
];

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Swipe to close detection
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    let startX = 0;
    const drawer = drawerRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentX = e.touches[0].clientX;
      const diff = startX - currentX;
      if (diff > 50) onClose(); // Swipe left threshold
    };

    drawer.addEventListener('touchstart', handleTouchStart);
    drawer.addEventListener('touchmove', handleTouchMove);

    return () => {
      drawer.removeEventListener('touchstart', handleTouchStart);
      drawer.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    logout();
    router.push('/');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] bg-cream shadow-2xl animate-slide-in-left flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-charcoal/10 flex items-center justify-between">
            <Logo size="sm" />
            <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-cream-dark text-charcoal/70 touch-target"
                aria-label="Close menu"
            >
                <X size={24} />
            </button>
        </div>

        {/* User Profile */}
        <div className="p-4 bg-cream-dark/30 border-b border-charcoal/10">
            <div className="flex items-center gap-3">
                <Avatar name={user?.name} size="md" />
                <div className="overflow-hidden">
                    <p className="font-semibold text-charcoal truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-charcoal/60 truncate">{user?.email}</p>
                </div>
            </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
            {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`
                            flex items-center gap-3 px-3 py-3 rounded-xl
                            transition-all duration-200 touch-target
                            border-l-4
                            ${isActive
                                ? 'bg-terracotta/10 text-terracotta font-semibold border-terracotta'
                                : 'text-charcoal/70 border-transparent hover:bg-cream-dark hover:text-charcoal'
                            }
                        `}
                    >
                        <Icon size={24} weight={isActive ? 'fill' : 'regular'} />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-charcoal/10">
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-charcoal/70 hover:bg-red-50 hover:text-red-600 transition-colors touch-target"
            >
                <SignOut size={24} />
                <span>Sign Out</span>
            </button>
        </div>
      </div>
    </div>
  );
};
