import { useEffect, type RefObject } from 'react';

interface PointerLightOptions {
  ease?: number;
  rest?: { x: number; y: number };
}

/** Smoothed --mx/--my and --rx/--ry on a host element for CSS 3D phone tilt + glare. */
export function usePointerLight<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: PointerLightOptions = {}
): void {
  const ease = options.ease ?? 0.09;
  const restX = options.rest?.x ?? 0.32;
  const restY = options.rest?.y ?? 0.22;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    const rest = { x: restX, y: restY };
    let target = { ...rest };
    let current = { ...rest };
    let frame = 0;
    let settled = true;

    const write = () => {
      el.style.setProperty('--mx', current.x.toFixed(4));
      el.style.setProperty('--my', current.y.toFixed(4));
      el.style.setProperty('--rx', ((current.x - 0.5) * 2).toFixed(4));
      el.style.setProperty('--ry', ((current.y - 0.5) * 2).toFixed(4));
    };

    const tick = () => {
      current = {
        x: current.x + (target.x - current.x) * ease,
        y: current.y + (target.y - current.y) * ease,
      };
      write();
      const done =
        Math.abs(target.x - current.x) < 0.0005 && Math.abs(target.y - current.y) < 0.0005;
      if (done) {
        current = { ...target };
        write();
        settled = true;
        frame = 0;
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    const kick = () => {
      if (settled) {
        settled = false;
        frame = window.requestAnimationFrame(tick);
      }
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      target = {
        x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
      };
      kick();
    };

    const onLeave = () => {
      target = { ...rest };
      kick();
    };

    write();
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);

    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ref, ease, restX, restY]);
}
