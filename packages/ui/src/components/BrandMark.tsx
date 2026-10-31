import React from 'react';
import { cn } from '../utils';

const sizePx = {
  sm: 32,
  md: 40,
  lg: 48,
} as const;

export type BrandMarkProps = {
  size?: keyof typeof sizePx;
  className?: string;
  /** Gentle accent ring — off by default for sidebars and auth. */
  animated?: boolean;
  /** Optional shell badge behind the mark. */
  framed?: boolean;
};

export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 'md',
  className,
  animated = false,
  framed = false,
}) => {
  const px = sizePx[size];

  const mark = (
    <span
      className={cn(
        'font-display inline-flex items-center justify-center rounded-full bg-accent/15 font-semibold text-accent',
        animated && 'motion-safe:animate-pulse',
        !framed && className
      )}
      style={{ width: px, height: px, fontSize: px * 0.42 }}
      aria-hidden
    >
      M
    </span>
  );

  if (!framed) {
    return mark;
  }

  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-shell shadow-[0_8px_24px_-12px_rgba(20,19,19,0.55)]',
        size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10',
        className
      )}
    >
      {mark}
    </span>
  );
};
