'use client';

import { WifiSlash } from '@phosphor-icons/react';

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-cream-lightest">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-charcoal/10 rounded-2xl flex items-center justify-center">
            <WifiSlash size={48} className="text-charcoal/50" weight="duotone" />
          </div>
        </div>
        <h1 className="text-3xl font-fraunces text-charcoal mb-3">You're Offline</h1>
        <p className="text-charcoal/60 text-lg mb-8">
          It looks like you've lost your internet connection. Check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-terracotta text-cream font-medium rounded-xl hover:bg-terracotta-dark transition-colors"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
