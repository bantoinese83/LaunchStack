import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
        className="group mystic-book-cta-slab flex w-full flex-wrap items-center justify-center gap-3 rounded-2xl bg-shell px-6 py-10 text-center text-paper transition hover:bg-shell/92 sm:gap-4 sm:py-12 md:py-14 lg:py-16"
      >
        <span className="font-display text-[clamp(1.65rem,5.5vw,3.75rem)] font-medium uppercase leading-[0.95] tracking-[-0.04em]">
          Book a house call
        </span>
        <ArrowRight
          className="size-9 shrink-0 transition-transform duration-300 group-hover:translate-x-1 sm:size-10 md:size-12"
          strokeWidth={1.75}
          aria-hidden
        />
      </Link>
    </section>
  );
}
