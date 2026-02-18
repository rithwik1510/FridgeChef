'use client';

import { useEffect, useState } from 'react';
import { DownloadSimple, X } from '@phosphor-icons/react';
import { safeLocalStorage } from '@/store/auth';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true); // Start hidden

  useEffect(() => {
    // Check if user already dismissed
    const wasDismissed = safeLocalStorage.getItem('pwa_install_dismissed');
    if (wasDismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setDismissed(false);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDismissed(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    safeLocalStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (dismissed || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-80 z-40">
      <div className="bg-white rounded-xl shadow-lg border border-charcoal/10 p-4 flex items-center gap-3">
        <div className="p-2 bg-terracotta/10 rounded-xl flex-shrink-0">
          <DownloadSimple size={24} weight="duotone" className="text-terracotta" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-charcoal">Install FridgeChef</p>
          <p className="text-xs text-charcoal/60">Add to home screen for quick access</p>
        </div>
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 bg-terracotta text-cream text-sm font-medium rounded-lg hover:bg-terracotta-dark transition-colors flex-shrink-0"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 text-charcoal/40 hover:text-charcoal transition-colors flex-shrink-0"
        >
          <X size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
};
