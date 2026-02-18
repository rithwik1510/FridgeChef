'use client';

import { useEffect } from 'react';
import { WarningCircle, ArrowCounterClockwise, House } from '@phosphor-icons/react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream-lightest flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-terracotta/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <WarningCircle size={32} weight="duotone" className="text-terracotta" />
        </div>

        <h2 className="text-xl font-semibold text-charcoal mb-2">
          Oops! Something went wrong
        </h2>

        <p className="text-charcoal/60 mb-6">
          We hit an unexpected error. You can try again or head back home.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-terracotta text-white rounded-xl font-medium transition-all duration-200 active:scale-95 hover:bg-terracotta/90"
          >
            <ArrowCounterClockwise size={20} weight="bold" />
            Try again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cream-dark text-charcoal rounded-xl font-medium transition-all duration-200 active:scale-95 hover:bg-cream-darker"
          >
            <House size={20} weight="bold" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
