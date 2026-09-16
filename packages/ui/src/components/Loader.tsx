import React from 'react';
import { cn } from '../utils';

export const Spinner: React.FC<{ className?: string; label?: string }> = ({
  className,
  label = 'Loading',
}) => (
  <span
    role="status"
    aria-label={label}
    className={cn(
      'inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-accent border-t-transparent',
      className
    )}
  />
);

export const PageLoader: React.FC<{ label?: string }> = ({ label = 'Loading' }) => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper atlas-grain text-ink">
    <Spinner label={label} />
    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">{label}</p>
  </div>
);
