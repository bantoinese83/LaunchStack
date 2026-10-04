'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@template/ui';
import { ArrowRight } from 'lucide-react';
import AnimatedGradientBackground from '@/components/ui/animated-gradient-background';
import { LAUNCHSTACK_HERO_GRADIENT } from '../lib/stackGradient';

export const CtaSection = () => (
  <section className="border-b border-line py-20 md:py-28">
    <div className="mx-auto max-w-6xl px-6">
      <div className="relative overflow-hidden rounded-2xl bg-shell px-8 py-14 text-paper md:px-14 md:py-16">
        <AnimatedGradientBackground
          Breathing
          startingGap={112}
          breathingRange={8}
          animationSpeed={0.013}
          topOffset={22}
          gradientColors={[...LAUNCHSTACK_HERO_GRADIENT.gradientColors]}
          gradientStops={[...LAUNCHSTACK_HERO_GRADIENT.gradientStops]}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-shell/25 via-transparent to-shell/80"
          aria-hidden
        />
        <div className="relative z-10 max-w-xl">
          <p className="type-eyebrow text-accent">LaunchStack</p>
          <h2 className="mt-4 font-display text-3xl font-medium tracking-tight sm:text-4xl text-balance">
            Stop rebuilding the foundation.
          </h2>
          <p className="mt-4 leading-relaxed text-white/60">
            Clone once. Share auth, billing, and RLS across web, admin, and mobile — then write the
            product.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Open the template <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/25 bg-transparent text-paper hover:border-white/50 hover:bg-white/5"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);
