'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  createFlowerField,
  drawHeroFlowers,
  drawLiveHeroFlowers,
  flowerCountForSize,
  initLiveFlowerField,
  pruneLiveFlowers,
  scrollProgressFullyBloomed,
  spawnLiveFlower,
  type LiveFlowerSpec,
} from '@/components/mystic/editorial/mystic-hero-flowers';
import {
  getMarketingCanvasDpr,
  subscribeManagedCanvasLoop,
} from '@/lib/mystic/managed-canvas-loop';

type Props = {
  className?: string;
};

const SPAWN_INTERVAL_MS = 850;
const SPAWN_JITTER_MS = 950;

/**
 * Hero flower field — live blooms spawn, open, fade, and respawn across the canvas.
 */
export function MysticHeroFlowerCanvas({ className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let staticFlowers = createFlowerField(1, 1, 1);
    let liveFlowers: LiveFlowerSpec[] = [];
    let maxLive = 40;
    let nextFlowerId = 0;
    let nextSpawnMs = 0;
    let cw = 0;
    let ch = 0;
    let ro: ResizeObserver | undefined;
    let baseAlpha = reduceMotion ? 0.38 : 0.48;

    const layoutCanvas = () => {
      const dpr = getMarketingCanvasDpr(2);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w < 1 || h < 1) return false;
      cw = w;
      ch = h;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.strokeStyle = 'white';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;
      ctx.shadowColor = 'rgba(26, 31, 24, 0.22)';
      ctx.globalAlpha = baseAlpha;
      return true;
    };

    const paintStatic = () => {
      if (cw < 1 || ch < 1) return;
      drawHeroFlowers(ctx, cw, ch, staticFlowers, scrollProgressFullyBloomed(), {
        idleMotion: false,
      });
    };

    const tickLiveSpawns = (timeMs: number) => {
      if (liveFlowers.length >= maxLive) return;
      if (timeMs < nextSpawnMs) return;
      liveFlowers.push(spawnLiveFlower(cw, ch, timeMs, nextFlowerId++));
      nextSpawnMs = timeMs + SPAWN_INTERVAL_MS + Math.random() * SPAWN_JITTER_MS;
    };

    const paintLive = (timeMs: number) => {
      if (cw < 1 || ch < 1) return;
      tickLiveSpawns(timeMs);
      liveFlowers = pruneLiveFlowers(liveFlowers, timeMs);
      drawLiveHeroFlowers(ctx, cw, ch, liveFlowers, timeMs, { idleMotion: true });
    };

    const initField = () => {
      if (!layoutCanvas()) return;
      const mobile = window.matchMedia('(max-width: 768px)').matches;
      const base = flowerCountForSize(cw, ch);
      maxLive = Math.max(24, Math.round(base * (mobile ? 0.72 : 1)));

      if (reduceMotion) {
        staticFlowers = createFlowerField(cw, ch, maxLive);
        paintStatic();
        return;
      }

      const now = performance.now();
      liveFlowers = initLiveFlowerField(cw, ch, Math.round(maxLive * 0.55), now, nextFlowerId);
      nextFlowerId += liveFlowers.length;
      nextSpawnMs = now + 300 + Math.random() * 500;
      paintLive(now);
    };

    initField();

    const unsubLoop = reduceMotion
      ? () => {}
      : subscribeManagedCanvasLoop(wrap, paintLive, {
          rootMargin: '80px 0px',
          maxFps: 50,
        });

    ro = new ResizeObserver(initField);
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
        'absolute inset-0 overflow-hidden',
        'bg-[radial-gradient(farthest-corner_circle_at_left_bottom,color-mix(in_srgb,var(--gold-soft)_55%,var(--paper))_0%,color-mix(in_srgb,var(--accent)_28%,var(--shell))_100%)]',
        '[contain:strict]',
        className
      )}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
