'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@template/ui';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroSection = () => (
  <section className="relative overflow-hidden border-b border-line">
    <div
      className="absolute inset-y-0 right-0 hidden w-[50%] atlas-ink-panel md:block"
      aria-hidden
    />

    <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1fr_1.08fr] md:py-24 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
          LaunchStack
        </p>
        <div className="atlas-rule mt-5 mb-7 w-16 bg-accent" style={{ height: 3 }} />
        <h1 className="font-display text-4xl font-semibold leading-[1.04] tracking-tight text-ink text-balance sm:text-5xl md:text-[3.65rem]">
          Ship the product.
          <br />
          Not the scaffolding.
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg">
          A typed monorepo for B2B SaaS and native apps — shared auth, billing, and RLS from day
          one.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Open the template <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#platform">
            <Button variant="outline" size="lg">
              See the stack
            </Button>
          </a>
        </div>
      </motion.div>

      <aside className="relative flex justify-center md:min-h-[440px] md:justify-end md:pl-6">
        <div className="relative flex w-full max-w-[440px] items-end justify-center gap-3 sm:gap-5 md:max-w-none md:justify-end">
          <motion.figure
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="atlas-float relative z-10 w-[46%] max-w-[210px] md:w-[48%] md:max-w-[230px]"
          >
            <div className="overflow-hidden rounded-[1.4rem] border-[3px] border-ink bg-ink shadow-[0_28px_56px_-22px_rgba(0,0,0,0.55)] ring-1 ring-white/10 md:border-paper/25">
              <Image
                src="/marketing/signin-ios.png"
                alt="LaunchStack sign-in on iPhone"
                width={470}
                height={1024}
                className="h-auto w-full"
                priority
              />
            </div>
            <figcaption className="mt-3 text-center font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted md:text-paper/55">
              iOS
            </figcaption>
          </motion.figure>

          <motion.figure
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="atlas-float-delayed relative z-0 mb-6 w-[46%] max-w-[210px] md:mb-12 md:w-[48%] md:max-w-[230px]"
          >
            <div className="overflow-hidden rounded-[1.15rem] border-[3px] border-ink bg-ink shadow-[0_28px_56px_-22px_rgba(0,0,0,0.55)] ring-1 ring-white/10 md:border-paper/25">
              <Image
                src="/marketing/signin-android.png"
                alt="LaunchStack sign-in on Android"
                width={460}
                height={1024}
                className="h-auto w-full"
                priority
              />
            </div>
            <figcaption className="mt-3 text-center font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted md:text-paper/55">
              Android
            </figcaption>
          </motion.figure>
        </div>
      </aside>
    </div>
  </section>
);
