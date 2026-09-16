import React from 'react';
import { cn } from '../utils';

export const BrandMark: React.FC<{ size?: 'sm' | 'md'; className?: string }> = ({
  size = 'md',
  className,
}) => (
  <span
    className={cn(
      'inline-flex items-center justify-center rounded-sm bg-ink font-display font-bold text-paper',
      size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-sm',
      className
    )}
  >
    LS
  </span>
);
