import React from 'react';
import { cn } from '../utils';
import { LaunchStackMarkGraphic, type LaunchStackMarkTone } from './LaunchStackMarkGraphic';

const sizePx = {
  sm: 32,
  md: 40,
  lg: 48,
} as const;

export type BrandMarkProps = {
  size?: keyof typeof sizePx;
  className?: string;
  /** Color token for the globe mark (defaults to shell on framed marks, inherit otherwise). */
  tone?: LaunchStackMarkTone;
  /** Gentle dot twinkle — off by default for sidebars and auth. */
  animated?: boolean;
  /** Optional shell badge behind the mark (legacy “LS” tile). */
  framed?: boolean;
};

export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 'md',
  className,
  tone,
  animated = false,
  framed = false,
}) => {
  const px = sizePx[size];
  const resolvedTone = tone ?? (framed ? 'paper' : 'shell');

  const mark = (
    <LaunchStackMarkGraphic
      size={framed ? px * 0.62 : px}
      tone={framed ? 'paper' : resolvedTone}
      animated={animated}
      className={cn(framed && 'relative z-[1]', !framed && className)}
    />
  );

  if (!framed) {
    return mark;
  }

  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-shell shadow-[0_8px_24px_-12px_rgba(20,19,19,0.55)]',
        'before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(218,55,80,0.45),transparent_55%)]',
        size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10',
        className
      )}
    >
      {mark}
    </span>
  );
};
