'use client';

import { useEffect, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';

type Grid = {
  rows: number;
  cols: number;
};

const DEFAULT_GRIDS: Record<string, Grid> = {
  '6x4': { rows: 4, cols: 6 },
  '8x8': { rows: 8, cols: 8 },
  '8x3': { rows: 3, cols: 8 },
  '4x6': { rows: 6, cols: 4 },
  '3x8': { rows: 8, cols: 3 },
};

type PredefinedGridKey = keyof typeof DEFAULT_GRIDS;

/** Stable per-cell delay so SSR and client hydration match (no Math.random). */
function pixelRevealDelay(
  index: number,
  rows: number,
  cols: number,
  src: string,
  maxAnimationDelay: number
) {
  let hash = 2166136261;
  for (let i = 0; i < src.length; i++) {
    hash ^= src.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= Math.imul(index + 1, 2654435761);
  hash ^= Math.imul(rows, 97);
  hash ^= Math.imul(cols, 13);
  const unit = (hash >>> 0) / 4294967295;
  return unit * maxAnimationDelay;
}

interface PixelImageProps {
  src: string;
  alt?: string;
  grid?: PredefinedGridKey;
  customGrid?: Grid;
  grayscaleAnimation?: boolean;
  pixelFadeInDuration?: number;
  maxAnimationDelay?: number;
  colorRevealDelay?: number;
  className?: string;
  imageClassName?: string;
}

export function PixelImage(props: PixelImageProps) {
  return <PixelImageGrid key={props.src} {...props} />;
}

function PixelImageGrid({
  src,
  alt = '',
  grid = '8x8',
  grayscaleAnimation = true,
  pixelFadeInDuration = 1000,
  maxAnimationDelay = 1200,
  colorRevealDelay = 1300,
  customGrid,
  className,
  imageClassName,
}: PixelImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showColor, setShowColor] = useState(false);

  const MIN_GRID = 1;
  const MAX_GRID = 16;

  const { rows, cols } = useMemo(() => {
    const isValidGrid = (value?: Grid) => {
      if (!value) return false;
      const { rows: r, cols: c } = value;
      return (
        Number.isInteger(r) &&
        Number.isInteger(c) &&
        r >= MIN_GRID &&
        c >= MIN_GRID &&
        r <= MAX_GRID &&
        c <= MAX_GRID
      );
    };

    return isValidGrid(customGrid) ? customGrid! : DEFAULT_GRIDS[grid];
  }, [customGrid, grid]);

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let colorTimeout: ReturnType<typeof setTimeout> | undefined;
    const deferId = window.setTimeout(() => {
      if (cancelled) return;
      raf = requestAnimationFrame(() => {
        if (!cancelled) setIsVisible(true);
      });
      colorTimeout = setTimeout(() => {
        if (!cancelled) setShowColor(true);
      }, colorRevealDelay);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(deferId);
      cancelAnimationFrame(raf);
      if (colorTimeout) clearTimeout(colorTimeout);
    };
  }, [colorRevealDelay]);

  const pieces = useMemo(() => {
    const total = rows * cols;
    return Array.from({ length: total }, (_, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      const x0 = col * (100 / cols);
      const y0 = row * (100 / rows);
      const x1 = (col + 1) * (100 / cols);
      const y1 = (row + 1) * (100 / rows);
      const clipPath = `polygon(${x0}% ${y0}%, ${x1}% ${y0}%, ${x1}% ${y1}%, ${x0}% ${y1}%)`;

      const delay =
        Math.round(pixelRevealDelay(index, rows, cols, src, maxAnimationDelay) * 100) / 100;
      return {
        clipPath,
        delay,
      };
    });
  }, [rows, cols, maxAnimationDelay, src]);

  return (
    <div className={cn('relative h-full w-full select-none', className)}>
      {pieces.map((piece, index) => (
        <div
          key={`${src}-${index}`}
          className={cn(
            'absolute inset-0 transition-all ease-out',
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            clipPath: piece.clipPath,
            transitionDelay: `${piece.delay}ms`,
            transitionDuration: `${pixelFadeInDuration}ms`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- clip-path grid requires native img */}
          <img
            src={src}
            alt={index === 0 ? alt : ''}
            className={cn(
              'absolute inset-0 h-full w-full object-cover',
              grayscaleAnimation && (showColor ? 'grayscale-0' : 'grayscale'),
              imageClassName
            )}
            style={{
              transition: grayscaleAnimation
                ? `filter ${pixelFadeInDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : 'none',
            }}
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}
