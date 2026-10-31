'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MYSTIC_MARKETING_IMAGES } from '@/lib/mystic/marketing-images';
import { cn } from '@/lib/utils';

/** Soft full-bleed atmosphere behind the editorial hero (distinct from collage photos). */
export function MysticHeroBackground() {
  const reduce = useReducedMotion();
  const src = MYSTIC_MARKETING_IMAGES.heroBg;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {reduce ? (
        <div
          className="absolute -inset-[10%] scale-105 bg-cover bg-center opacity-[0.2] blur-3xl"
          style={{ backgroundImage: `url(${src})` }}
        />
      ) : (
        <motion.div
          className="absolute -inset-[12%] bg-cover bg-center opacity-[0.24] blur-3xl"
          style={{ backgroundImage: `url(${src})` }}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1.12 }}
          transition={{ duration: 32, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
      <div className="mystic-hero-glow absolute inset-0 opacity-95" />
      <div
        className={cn(
          'absolute inset-0',
          'bg-gradient-to-b from-paper/55 via-paper/88 to-paper',
          'lg:bg-gradient-to-r lg:from-paper lg:via-paper/90 lg:to-paper/50'
        )}
      />
      <div className="mystic-hero-bleed-overlay absolute inset-0 opacity-70 mix-blend-multiply" />
    </div>
  );
}
