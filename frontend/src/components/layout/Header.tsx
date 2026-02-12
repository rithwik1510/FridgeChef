'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { GUEST_DEMO_ENABLED } from '@/lib/demoMode';
import { SignOut, Gear, CaretDown } from '@phosphor-icons/react';

export const Header = () => {
  const router = useRouter();
  const { user, logout, hasHydrated, isLoading } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isGuestDemo = GUEST_DEMO_ENABLED && hasHydrated && !isLoading && !user;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="gradient-header border-b border-charcoal/10 sticky top-0 z-50 shadow-soft relative texture-noise">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hover:opacity-90 transition-opacity">
              <Logo size="md" />
            </Link>
            {isGuestDemo && (
              <span className="hidden sm:inline-flex items-center rounded-full border border-terracotta/25 bg-terracotta/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-terracotta animate-fade-in">
                Demo
              </span>
            )}
          </div>

          {/* User Info and Dropdown */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-cream-dark/50 transition-colors"
                aria-label="User menu"
                aria-expanded={isDropdownOpen}
              >
                <Avatar name={user?.name} size="sm" />
                <span className="text-charcoal/80 hidden sm:block font-medium">
                  {user?.name || 'User'}
                </span>
                <CaretDown
                  size={16}
                  className={`text-charcoal/60 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-cream rounded-xl shadow-medium border border-cream-darker overflow-hidden animate-scale-in origin-top-right">
                  <div className="px-4 py-3 border-b border-cream-darker">
                    <p className="text-sm font-medium text-charcoal">{user?.name || 'User'}</p>
                    <p className="text-xs text-charcoal/60 truncate">{user?.email || ''}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-charcoal/80 hover:bg-cream-dark hover:text-charcoal transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Gear size={18} />
                      <span>Settings</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-charcoal/80 hover:bg-cream-dark hover:text-terracotta transition-colors"
                    >
                      <SignOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="hover:-translate-y-0.5">Sign In</Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button variant="primary" size="sm" className="hover:-translate-y-0.5">Join</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
