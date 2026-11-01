'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  createFlowerField,
  drawHeroFlowers,
  flowerCountForSize,
  heroBloomScrollProgress,
  scrollProgressFullyBloomed,
} from '@/components/mystic/editorial/mystic-hero-flowers';
import {
  getMarketingCanvasDpr,
  subscribeManagedCanvasLoop,
} from '@/lib/mystic/managed-canvas-loop';
import { subscribeScrollResize } from '@/lib/mystic/throttled-scroll';

type Props = {
  className?: string;
};

/**
 * Hero flower field — scroll-staggered bloom; loop pauses off-screen / hidden tab.
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

    const section = wrap.closest('section');
    if (!section) return;

    let flowers = createFlowerField(1, 1, 1);
    let cw = 0;
    let ch = 0;
    let ro: ResizeObserver | undefined;
    let scrollProgress = reduceMotion ? scrollProgressFullyBloomed() : 0;
    let lastPaintProgress = -1;
    let lastIdlePaintMs = 0;

    const readScrollProgress = () => {
      if (reduceMotion) {
        scrollProgress = scrollProgressFullyBloomed();
        return;
      }
      scrollProgress = heroBloomScrollProgress(section);
    };

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
      ctx.globalAlpha = reduceMotion ? 0.38 : 0.48;
      return true;
    };

    const paint = (timeMs: number) => {
      if (cw < 1 || ch < 1) return;
      drawHeroFlowers(ctx, cw, ch, flowers, scrollProgress, {
        timeMs,
        idleMotion: !reduceMotion,
      });
    };

    const paintIfNeeded = (timeMs: number) => {
      const progressDelta = Math.abs(scrollProgress - lastPaintProgress);
      const scrolling = progressDelta > 0.0015;
      const idleDue = !reduceMotion && timeMs - lastIdlePaintMs >= 36;
      if (!scrolling && !idleDue) return;
      paint(timeMs);
      if (scrolling) lastPaintProgress = scrollProgress;
      lastIdlePaintMs = timeMs;
    };

    const initField = () => {
      if (!layoutCanvas()) return;
      const mobile = window.matchMedia('(max-width: 768px)').matches;
      const base = flowerCountForSize(cw, ch);
      const count = Math.max(28, Math.round(base * (mobile ? 0.78 : 1)));
      flowers = createFlowerField(cw, ch, count);
      readScrollProgress();
      lastPaintProgress = -1;
      paint(0);
    };

    const start = () => {
      initField();
      readScrollProgress();
      paintIfNeeded(performance.now());
    };

    start();

    const unsubScroll = subscribeScrollResize(() => {
      readScrollProgress();
    });

    const unsubLoop = subscribeManagedCanvasLoop(wrap, paintIfNeeded, {
      rootMargin: '80px 0px',
      maxFps: 50,
    });

    ro = new ResizeObserver(start);
    ro.observe(wrap);

    return () => {
      unsubScroll();
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
