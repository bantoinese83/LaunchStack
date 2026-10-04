'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Button } from '@template/ui';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedGradientBackground from '@/components/ui/animated-gradient-background';
import { usePointerLight } from '@/hooks/usePointerLight';
import { LAUNCHSTACK_HERO_GRADIENT } from '../lib/stackGradient';
import { PhoneMockups } from './phone3d/PhoneMockups';

export const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  usePointerLight(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-white/10 bg-shell text-paper"
    >
      <AnimatedGradientBackground
        Breathing
        startingGap={128}
        breathingRange={9}
        animationSpeed={0.014}
        topOffset={28}
        gradientColors={[...LAUNCHSTACK_HERO_GRADIENT.gradientColors]}
        gradientStops={[...LAUNCHSTACK_HERO_GRADIENT.gradientStops]}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-shell/20 via-transparent to-shell/75"
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1fr_1fr] md:py-24 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="type-eyebrow text-accent">Monorepo · 2026</p>
          <div className="atlas-rule mt-5 mb-8 w-20" />
          <h1 className="font-display text-[clamp(2.5rem,5.5vw,4.25rem)] font-medium leading-[1.02] tracking-tight text-balance">
            Ship the product.
            <span className="block text-white/75">Not the scaffolding.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/60 sm:text-lg">
            A typed monorepo for B2B SaaS and native apps — shared auth, billing, and RLS from day
            one. Same cross-platform polish you expect on a studio site, with enterprise seams built
            in.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Open the template <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#stack">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent text-paper hover:border-white/40 hover:bg-white/5"
              >
                See the stack
              </Button>
            </a>
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex justify-center md:justify-end"
        >
          <PhoneMockups />
        </motion.aside>
      </div>
    </section>
  );
};
