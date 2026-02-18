'use client';

import { useEffect } from 'react';
import { WarningCircle, ArrowCounterClockwise } from '@phosphor-icons/react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-terracotta/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <WarningCircle size={32} weight="duotone" className="text-terracotta" />
        </div>

        <h2 className="text-xl font-semibold text-charcoal mb-2">
          Something went wrong
        </h2>

        <p className="text-charcoal/60 mb-6">
          We encountered an unexpected error. Please try again.
        </p>

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-white rounded-xl font-medium transition-all duration-200 active:scale-95 hover:bg-terracotta/90"
        >
          <ArrowCounterClockwise size={20} weight="bold" />
          Try again
        </button>
      </div>
    </div>
  );
}
