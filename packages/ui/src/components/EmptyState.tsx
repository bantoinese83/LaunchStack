import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../utils';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center rounded-md border border-dashed border-line bg-surface/60 px-6 py-14 text-center',
      className
    )}
  >
    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-line bg-paper text-muted">
      <Inbox className="h-5 w-5" aria-hidden />
    </div>
    <h3 className="font-display text-lg font-semibold tracking-tight text-ink">{title}</h3>
    {description && (
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
