'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { Highlighter } from '@/components/ui/highlighter';
import { SpinningText } from '@/components/ui/spinning-text';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

/** Full-bleed book CTA — editorial “decision” band. */
export function MysticBookCtaSlab({ className }: Props) {
  return (
    <section
      className={cn('bg-paper px-5 pt-2 pb-10 md:px-8 md:pb-12', className)}
      aria-label="Book a house call"
    >
      <Link
        href="/book"
        className="group mystic-book-cta-slab relative flex w-full flex-wrap items-center justify-center gap-3 overflow-hidden rounded-2xl bg-shell px-6 py-10 text-center text-paper transition hover:bg-shell/92 sm:gap-4 sm:py-12 md:py-14 lg:py-16"
      >
        <FlickeringGrid
          aria-hidden
          className="absolute inset-0 z-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent_88%)]"
          squareSize={4}
          gridGap={6}
          color="#c4a962"
          maxOpacity={0.45}
          flickerChance={0.12}
        />
        <span className="relative z-10 font-display text-[clamp(1.65rem,5.5vw,3.75rem)] font-medium uppercase leading-[0.95] tracking-[-0.04em]">
          Book a{' '}
          <Highlighter
            action="underline"
            color="#c4a962"
            strokeWidth={2.5}
            animationDuration={800}
            isView
            className="relative inline-block bg-transparent"
          >
            house call
          </Highlighter>
        </span>
        <span className="relative z-10 hidden size-16 shrink-0 md:flex md:items-center md:justify-center">
          <SpinningText
            duration={12}
            radius={3.8}
            className="size-full text-[0.5rem] font-semibold uppercase tracking-[0.32em] text-gold/90"
          >
            chicago · online · stripe ·
          </SpinningText>
          <ArrowRight
            className="absolute size-7 transition-transform duration-300 group-hover:translate-x-0.5"
            strokeWidth={1.75}
            aria-hidden
          />
        </span>
        <ArrowRight
          className="relative z-10 size-9 shrink-0 md:hidden transition-transform duration-300 group-hover:translate-x-1 sm:size-10"
          strokeWidth={1.75}
          aria-hidden
        />
      </Link>
    </section>
  );
}
