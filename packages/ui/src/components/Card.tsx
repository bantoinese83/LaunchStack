import React from 'react';
import { cn } from '../utils';

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'rounded-xl border border-line bg-surface p-6 text-ink shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_20px_50px_-40px_rgba(31,30,30,0.35)]',
      className
    )}
    {...props}
  >
    {children}
  </div>
);
