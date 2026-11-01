'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PixelImage } from '@/components/ui/pixel-image';
import { SpinningText } from '@/components/ui/spinning-text';
import { MYSTIC_MARKETING_IMAGES } from '@/lib/mystic/marketing-images';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

const SCENES = MYSTIC_MARKETING_IMAGES.stylistHeroScenes;
const SCENE_LABELS = [
  'Luke on a house call, cutting hair',
  'Luke with shears and comb',
  'Luke finishing a blowout',
] as const;

const ROTATE_MS = 6500;

/** Editorial hero — cycles AI scenes with Magic UI pixel reveal. */
export function StylistHeroFigure({ className }: Props) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce || SCENES.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SCENES.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [reduce]);

  const src = SCENES[index] ?? SCENES[0];
  const alt = SCENE_LABELS[index] ?? 'Luke — Mystic Hair Co. stylist';

  return (
    <div className={cn('relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-none', className)}>
      <div
        aria-hidden
        className="absolute inset-[8%] -z-10 rounded-[2rem] bg-gradient-to-br from-accent-soft/60 via-gold-soft/50 to-transparent blur-2xl"
      />
      <div className="absolute inset-0 overflow-hidden rounded-[1.75rem] ring-1 ring-line/35 shadow-[0_28px_60px_-28px_rgba(26,31,24,0.4)]">
        <AnimatePresence mode="sync">
          <motion.div
            key={src}
            className="absolute inset-0"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <PixelImage
              src={src}
              alt={alt}
              grid="8x8"
              grayscaleAnimation={!reduce}
              pixelFadeInDuration={reduce ? 0 : 900}
              maxAnimationDelay={reduce ? 0 : 1000}
              colorRevealDelay={reduce ? 0 : 1100}
              imageClassName="object-[center_20%]"
            />
          </motion.div>
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-paper/45 via-transparent to-paper/5" />
      </div>
      {!reduce ? (
        <Link
          href="/book"
          className="absolute -right-2 top-3 z-30 flex size-[8.5rem] items-center justify-center sm:-right-4 sm:top-5 sm:size-[9.5rem]"
          aria-label="Book a Mystic house call"
        >
          <SpinningText
            duration={18}
            radius={5.5}
            reverse
            className="size-full font-sans text-[0.625rem] font-semibold uppercase text-plum sm:text-[0.6875rem]"
          >
            book · mystic · house call ·
          </SpinningText>
        </Link>
      ) : (
        <Link
          href="/book"
          className="absolute right-3 top-6 z-30 rounded-full border border-line/60 bg-paper/95 px-3 py-1.5 font-sans text-[0.6875rem] font-semibold uppercase tracking-wider text-plum shadow-sm"
        >
          Book
        </Link>
      )}
      {!reduce && SCENES.length > 1 ? (
        <div
          className="absolute -bottom-1 left-1/2 z-20 flex -translate-x-1/2 gap-1.5"
          role="tablist"
          aria-label="Hero scene"
        >
          {SCENES.map((scene, i) => (
            <button
              key={scene}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={SCENE_LABELS[i]}
              onClick={() => setIndex(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === index ? 'w-6 bg-plum' : 'w-1.5 bg-line hover:bg-muted'
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
