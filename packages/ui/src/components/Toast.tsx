import React from 'react';
import { X, Check } from 'lucide-react';

export interface ToastProps {
  message: string;
  onDismiss?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => (
  <div
    role="status"
    className="fixed top-5 right-5 z-50 flex max-w-sm items-center gap-2.5 rounded-md border border-accent/20 bg-accent-soft px-4 py-3 text-sm text-success shadow-[0_12px_32px_-16px_rgba(20,23,20,0.35)] animate-[rise_220ms_ease-out]"
  >
    <Check className="h-4 w-4 shrink-0" aria-hidden />
    <span className="min-w-0 flex-1 leading-snug">{message}</span>
    {onDismiss && (
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-sm p-0.5 text-accent/70 hover:bg-accent/10 hover:text-accent"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    )}
  </div>
);
