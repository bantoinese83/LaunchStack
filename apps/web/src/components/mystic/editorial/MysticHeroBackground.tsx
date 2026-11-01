'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { MYSTIC_MARKETING_IMAGES } from '@/lib/mystic/marketing-images';
import { MysticHeroFlowerCanvas } from '@/components/mystic/editorial/MysticHeroFlowerCanvas';
import { cn } from '@/lib/utils';

/** Soft full-bleed atmosphere behind the editorial hero (distinct from collage photos). */
export function MysticHeroBackground() {
  const reduce = useReducedMotion();
  const src = MYSTIC_MARKETING_IMAGES.heroBg;
  const rootRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(rootRef, { amount: 0.05, margin: '0px 0px -10% 0px' });

  return (
    <div ref={rootRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {reduce ? (
        <div
          className="absolute -inset-[10%] scale-105 bg-cover bg-center opacity-[0.2] blur-3xl"
          style={{ backgroundImage: `url(${src})` }}
        />
      ) : (
        <motion.div
          className="absolute -inset-[12%] bg-cover bg-center opacity-[0.24] blur-3xl will-change-transform"
          style={{ backgroundImage: `url(${src})` }}
          initial={false}
          animate={heroInView ? { scale: [1.05, 1.12] } : { scale: 1.05 }}
          transition={{
            duration: 32,
            ease: 'easeInOut',
            repeat: heroInView ? Infinity : 0,
            repeatType: 'reverse',
          }}
        />
      )}
      <MysticHeroFlowerCanvas className="opacity-[0.52] mix-blend-multiply sm:opacity-60" />
      <div className="mystic-hero-glow absolute inset-0 opacity-95" />
      <div
        className={cn(
          'absolute inset-0',
          'bg-gradient-to-b from-paper/40 via-paper/82 to-paper',
          'lg:bg-gradient-to-r lg:from-paper/75 lg:via-paper/88 lg:to-paper/35'
        )}
      />
      <div className="mystic-hero-bleed-overlay absolute inset-0 opacity-70 mix-blend-multiply" />
    </div>
  );
}
