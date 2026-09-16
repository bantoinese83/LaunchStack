import React from 'react';
import { cn } from '../utils';

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('rounded-md border border-line bg-surface p-6 text-ink', className)}
    {...props}
  >
    {children}
  </div>
);
