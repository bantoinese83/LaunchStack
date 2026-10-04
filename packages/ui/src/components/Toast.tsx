import React from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import { cn } from '../utils';

export type ToastVariant = 'success' | 'error';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-accent/20 bg-accent-soft text-success',
  error: 'border-red-200 bg-red-50 text-danger',
};

export const Toast: React.FC<ToastProps> = ({ message, variant = 'success', onDismiss }) => {
  const Icon = variant === 'error' ? AlertCircle : Check;

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={cn(
        'fixed top-5 right-5 z-50 flex max-w-sm items-center gap-2.5 rounded-md border px-4 py-3 text-sm shadow-[0_12px_32px_-16px_rgba(20,23,20,0.35)] animate-[rise_220ms_ease-out]',
        variantStyles[variant]
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 leading-snug">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-sm p-0.5 opacity-70 transition-opacity hover:bg-ink/5 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
