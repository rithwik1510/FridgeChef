'use client';

import Link from 'next/link';
import { Sparkle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';

interface DemoModeBannerProps {
  title?: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({
  title = 'Guest Demo Mode',
  message,
  ctaLabel,
  ctaHref,
  className = '',
}) => {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border border-terracotta/20
        bg-gradient-to-r from-cream-lightest via-cream to-cream-dark/70
        shadow-soft card-shine animate-slide-up
        ${className}
      `}
    >
      <div className="absolute inset-0 pointer-events-none bg-noise opacity-[0.025]" />
      <div className="relative px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 mb-1.5 text-terracotta">
            <Sparkle size={16} weight="fill" className="animate-bounce-subtle" />
            <span className="text-xs font-semibold uppercase tracking-wide">{title}</span>
          </div>
          <p className="text-sm text-charcoal/80 mb-0">{message}</p>
        </div>

        {ctaLabel && ctaHref && (
          <Link href={ctaHref} className="sm:flex-shrink-0">
            <Button size="sm" variant="outline" className="w-full sm:w-auto">
              {ctaLabel}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

