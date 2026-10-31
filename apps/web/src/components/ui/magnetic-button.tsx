'use client';

/**
 * Magnetic pull toward cursor — adapted from 21st / Hirael (MIT).
 * @see https://21st.dev/@mohammadshehadeh/components/magnetic-button
 */

import * as React from 'react';
import { motion, useReducedMotion, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

const SPRING = { stiffness: 200, damping: 15, mass: 0.1 };

type Props = {
  strength?: number;
  className?: string;
  children?: React.ReactNode;
};

export function MagneticButton({ className, strength = 0.35, children }: Props) {
  const reduced = useReducedMotion();
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      data-slot="magnetic-button"
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      style={{ x, y }}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.div>
  );
}
