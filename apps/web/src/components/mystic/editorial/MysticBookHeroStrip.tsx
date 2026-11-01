import Link from 'next/link';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';

/** Compact booking strip — flat row, no nested card chrome. */
export function MysticBookHeroStrip() {
  return (
    <div className="mt-7 w-full max-w-lg border-t border-line/70 pt-5">
      <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
        <Link
          href="/book"
          className="min-w-[7rem] transition hover:text-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
        >
          <span className="type-eyebrow block text-[10px] text-muted">Service</span>
          <span className="mt-0.5 block text-sm font-medium text-ink">Blowouts &amp; styling</span>
        </Link>
        <Link
          href="/book"
          className="min-w-[7rem] transition hover:text-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
        >
          <span className="type-eyebrow block text-[10px] text-muted">Where</span>
          <span className="mt-0.5 block text-sm font-medium text-ink">Chicago house call</span>
        </Link>
        <MysticMagneticLink href="/book" size="sm" className="ml-auto whitespace-nowrap">
          Book
        </MysticMagneticLink>
      </div>
      <p className="type-eyebrow mt-3 text-[10px] text-muted">
        Secure checkout · Stripe · Real-time availability
      </p>
    </div>
  );
}
