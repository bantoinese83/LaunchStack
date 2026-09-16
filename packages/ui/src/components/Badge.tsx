import React from 'react';
import { cn } from '../utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
}

export const Badge = ({ className, variant = 'default', children, ...props }: BadgeProps) => {
  const styles = {
    default: 'bg-paper text-muted border-line',
    success: 'bg-accent-soft text-accent border-accent/20',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-danger border-red-200',
    info: 'bg-accent-soft text-accent border-accent/20',
    purple: 'bg-paper text-ink border-line',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold tracking-[0.08em] uppercase',
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
