import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '../utils';

export interface AlertProps {
  variant?: 'error' | 'success' | 'info';
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'error', children, className }) => {
  const styles = {
    error: 'border-red-200 bg-red-50 text-danger',
    success: 'border-accent/20 bg-accent-soft text-accent',
    info: 'border-line bg-paper text-muted',
  };
  const Icon = variant === 'success' ? Check : AlertCircle;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-sm leading-snug',
        styles[variant],
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-80" aria-hidden />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
};
