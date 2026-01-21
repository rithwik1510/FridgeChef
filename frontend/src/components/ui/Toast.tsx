'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, WarningCircle, Info, Warning } from '@phosphor-icons/react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{
  toasts: Toast[];
  removeToast: (id: string) => void;
}> = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="
      fixed z-50 flex flex-col gap-2 max-w-sm
      bottom-20 right-4 left-4
      sm:left-auto
      lg:bottom-4
      safe-bottom
    ">
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
          style={{ animationDelay: `${index * 50}ms` }}
        />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: Toast;
  onClose: () => void;
  style?: React.CSSProperties;
}> = ({ toast, onClose, style }) => {
  const typeStyles = {
    success: {
      bg: 'bg-sage',
      icon: CheckCircle,
      iconColor: 'text-cream',
    },
    error: {
      bg: 'bg-terracotta',
      icon: WarningCircle,
      iconColor: 'text-cream',
    },
    info: {
      bg: 'bg-butter',
      icon: Info,
      iconColor: 'text-charcoal',
    },
    warning: {
      bg: 'bg-butter-dark',
      icon: Warning,
      iconColor: 'text-charcoal',
    },
  };

  const { bg, icon: Icon, iconColor } = typeStyles[toast.type];
  const textColor = toast.type === 'info' || toast.type === 'warning' ? 'text-charcoal' : 'text-cream';

  return (
    <div
      className={`
        ${bg} ${textColor}
        rounded-xl shadow-medium
        p-4 min-w-[280px]
        animate-slide-up
        flex items-start gap-3
      `}
      style={style}
      role="alert"
    >
      <Icon size={24} weight="fill" className={`${iconColor} flex-shrink-0 mt-0.5`} />

      <div className="flex-1 min-w-0">
        <p className="font-medium">{toast.title}</p>
        {toast.message && (
          <p className={`text-sm mt-1 opacity-90 break-words leading-snug`}>{toast.message}</p>
        )}
      </div>

      <button
        onClick={onClose}
        className={`
          ${textColor} opacity-70 hover:opacity-100
          transition-opacity p-1 -m-1
          flex-shrink-0
        `}
        aria-label="Close"
      >
        <X size={18} weight="bold" />
      </button>
    </div>
  );
};

// Helper hooks for common toast types
export const useSuccessToast = () => {
  const { addToast } = useToast();
  return (title: string, message?: string) => addToast({ type: 'success', title, message });
};

export const useErrorToast = () => {
  const { addToast } = useToast();
  return (title: string, message?: string) => addToast({ type: 'error', title, message });
};

export const useInfoToast = () => {
  const { addToast } = useToast();
  return (title: string, message?: string) => addToast({ type: 'info', title, message });
};

export const useWarningToast = () => {
  const { addToast } = useToast();
  return (title: string, message?: string) => addToast({ type: 'warning', title, message });
};
