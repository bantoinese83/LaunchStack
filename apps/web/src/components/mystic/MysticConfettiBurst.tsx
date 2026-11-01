'use client';

import { useEffect, useRef } from 'react';

type Props = {
  /** Fire once when true. */
  active: boolean;
};

/** Brand-toned confetti for booking / plan success (client-only). */
export function MysticConfettiBurst({ active }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (!active || fired.current) return;
    fired.current = true;
    void (async () => {
      const confetti = (await import('canvas-confetti')).default;
      const colors = ['#C4A962', '#6B4F5B', '#7A8F6E', '#8B7355', '#F8F3E6'];
      confetti({
        particleCount: 80,
        spread: 72,
        origin: { y: 0.35 },
        colors,
        disableForReducedMotion: true,
      });
      window.setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.4 },
          colors,
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.4 },
          colors,
          disableForReducedMotion: true,
        });
      }, 180);
    })();
  }, [active]);

  return null;
}
