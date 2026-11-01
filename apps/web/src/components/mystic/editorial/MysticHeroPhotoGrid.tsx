'use client';

import { useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';
import { cn } from '@/lib/utils';

/** Accent cells — contact-sheet grid (ROSSI-style), Mystic plum multiply. */
const ACCENT_CELLS = new Set([2, 7, 18, 23, 36, 39, 44, 53, 58, 60]);

type Props = {
  active?: boolean;
  className?: string;
};

export function MysticHeroPhotoGrid({ active = false, className }: Props) {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(reduce ?? false);

  useDeferredEffect(() => {
    if (reduce || active) setRevealed(true);
  }, [active, reduce]);

  return (
    <div
      className={cn(
        'mystic-hero-photo-grid pointer-events-none absolute inset-0 grid grid-cols-8 grid-rows-8',
        revealed && 'mystic-hero-photo-grid--revealed',
        className
      )}
      aria-hidden
    >
      {Array.from({ length: 64 }, (_, i) => (
        <div
          key={i}
          className={cn(
            'mystic-hero-photo-grid__cell border border-white/25',
            ACCENT_CELLS.has(i) && 'bg-plum/35 mix-blend-multiply'
          )}
          style={{
            animationDelay: `${(i % 8) * 0.035 + Math.floor(i / 8) * 0.028}s`,
          }}
        />
      ))}
    </div>
  );
}
