import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', inputMode, enterKeyHint, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-charcoal mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          inputMode={inputMode}
          enterKeyHint={enterKeyHint}
          className={`
            w-full px-4 py-3 text-base
            bg-cream-dark text-charcoal
            border-2 border-transparent rounded-xl
            focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20
            transition-all duration-200
            placeholder:text-charcoal/40
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-charcoal/60">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
