'use client';

import type { CSSProperties, MouseEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/** Pointer-driven CSS vars for footer pattern parallax + spotlight. */
export function useFooterPatternPointer() {
  const reduceMotion = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [mx, setMx] = useState(0.5);
  const [my, setMy] = useState(0.5);

  const onMouseMove = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (reduceMotion) return;
      const rect = event.currentTarget.getBoundingClientRect();
      setMx((event.clientX - rect.left) / rect.width);
      setMy((event.clientY - rect.top) / rect.height);
      setHover(true);
    },
    [reduceMotion]
  );

  const onMouseLeave = useCallback(() => {
    setHover(false);
    setMx(0.5);
    setMy(0.5);
  }, []);

  const style = useMemo(
    () =>
      ({
        '--mystic-pattern-mx': mx,
        '--mystic-pattern-my': my,
        '--mystic-pattern-hover': hover && !reduceMotion ? 1 : 0,
      }) as CSSProperties,
    [hover, mx, my, reduceMotion]
  );

  return { style, onMouseMove, onMouseLeave };
}

/** Overlapping-cubes pattern stack (drift + hover parallax). */
export function MysticFooterPatternLayers() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mystic-pattern-overlapping-cubes mystic-pattern-overlapping-cubes--live mystic-footer-pattern-parallax opacity-[0.52] motion-reduce:animate-none"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mystic-footer-pattern-spotlight motion-reduce:opacity-0"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mystic-footer-pattern-shimmer motion-reduce:animate-none motion-reduce:opacity-0"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-shell/55 via-shell/15 to-shell/70"
      />
    </>
  );
}
