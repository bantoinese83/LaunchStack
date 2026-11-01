'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  MAX_WAVES,
  pickWaveColor,
  Wave,
  WAVE_SPAWN_INTERVAL,
} from '@/components/mystic/editorial/mystic-experience-waves';
import {
  getMarketingCanvasDpr,
  subscribeManagedCanvasLoop,
} from '@/lib/mystic/managed-canvas-loop';

type Props = {
  className?: string;
};

/**
 * Animated ribbon waves — pauses when off-screen; canvas size only updates on resize.
 */
export function MysticExperienceWaveCanvas({ className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let cw = 0;
    let ch = 0;
    let cx = 0;
    let frames = 0;
    let colorIndex = 0;
    let waves: Wave[] = [];
    let ro: ResizeObserver | undefined;

    const layout = () => {
      const dpr = getMarketingCanvasDpr(2);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w < 1 || h < 1) return false;
      cw = w;
      ch = h;
      cx = cw / 2;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      return true;
    };

    const seedWaves = () => {
      waves = [new Wave(pickWaveColor(0), cw, ch, cx)];
      colorIndex = 1;
      frames = 0;
    };

    const drawFrame = () => {
      if (cw < 1 || ch < 1) return;

      ctx.clearRect(0, 0, cw, ch);

      const moment = reduceMotion ? 42 : Date.now() / 30;
      if (!reduceMotion) frames += 1;

      if (!reduceMotion && frames % WAVE_SPAWN_INTERVAL === 0 && waves.length < MAX_WAVES) {
        waves.push(new Wave(pickWaveColor(colorIndex), cw, ch, cx));
        colorIndex += 1;
      }

      waves = waves.filter((w) => {
        if (!reduceMotion && w.isExpired() && frames % WAVE_SPAWN_INTERVAL !== 0) {
          return false;
        }
        return true;
      });

      if (waves.length === 0) {
        seedWaves();
      }

      for (const w of waves) {
        w.draw(ctx, moment, frames, ch);
      }
    };

    const restart = () => {
      if (!layout()) return;
      seedWaves();
      drawFrame();
    };

    restart();

    const unsubLoop = subscribeManagedCanvasLoop(wrap, drawFrame, {
      rootMargin: '100px 0px',
      maxFps: 45,
    });

    ro = new ResizeObserver(restart);
    ro.observe(wrap);

    return () => {
      unsubLoop();
      ro?.disconnect();
    };
  }, [reduceMotion]);

  return (
    <div
      ref={wrapRef}
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        'bg-[radial-gradient(ellipse_85%_70%_at_20%_100%,color-mix(in_srgb,var(--accent)_35%,var(--shell))_0%,var(--shell)_55%)]',
        '[contain:strict]',
        className
      )}
      aria-hidden
    >
      <canvas ref={canvasRef} className="block h-full w-full opacity-95" />
      <div className="absolute inset-0 bg-gradient-to-b from-shell/20 via-transparent to-shell/75" />
    </div>
  );
}
