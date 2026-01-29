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
          index={index}
        />
      ))}
    </div>
  );
};

// Animated success checkmark icon
const AnimatedCheckIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`w-6 h-6 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background circle */}
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
    {/* Expanding ring animation */}
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      opacity="0.3"
      className="animate-success-ring origin-center"
    />
    {/* Checkmark */}
    <path
      d="M7 12.5L10.5 16L17 9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      style={{
        strokeDasharray: 20,
        strokeDashoffset: 20,
        animation: 'successCheck 0.4s ease-out 0.1s forwards',
      }}
    />
  </svg>
);

// Animated error icon
const AnimatedErrorIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`w-6 h-6 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background circle */}
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
    {/* X mark */}
    <path
      d="M8 8L16 16M16 8L8 16"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
      className="animate-fade-in"
    />
  </svg>
);

const ToastItem: React.FC<{
  toast: Toast;
  onClose: () => void;
  index: number;
}> = ({ toast, onClose, index }) => {
  const typeStyles = {
    success: {
      bg: 'bg-sage',
      icon: AnimatedCheckIcon,
      iconColor: 'text-cream',
      animation: '',
    },
    error: {
      bg: 'bg-terracotta',
      icon: AnimatedErrorIcon,
      iconColor: 'text-cream',
      animation: 'animate-error-shake',
    },
    info: {
      bg: 'bg-butter',
      icon: () => <Info size={24} weight="fill" className="text-charcoal" />,
      iconColor: 'text-charcoal',
      animation: '',
    },
    warning: {
      bg: 'bg-butter-dark',
      icon: () => <Warning size={24} weight="fill" className="text-charcoal" />,
      iconColor: 'text-charcoal',
      animation: '',
    },
  };

  const { bg, icon: Icon, iconColor, animation } = typeStyles[toast.type];
  const textColor = toast.type === 'info' || toast.type === 'warning' ? 'text-charcoal' : 'text-cream';

  return (
    <div
      className={`
        ${bg} ${textColor}
        rounded-xl shadow-medium
        p-4 min-w-[280px]
        animate-slide-in-bottom
        flex items-start gap-3
        ${animation}
      `}
      style={{ animationDelay: `${index * 50}ms` }}
      role="alert"
    >
      <div className={`${iconColor} flex-shrink-0 mt-0.5`}>
        <Icon className={iconColor} />
      </div>

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
          hover:scale-110 active:scale-95
          transition-transform duration-150
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
