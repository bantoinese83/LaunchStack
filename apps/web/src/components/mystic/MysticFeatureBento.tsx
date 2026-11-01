'use client';

import type { LucideIcon } from 'lucide-react';
import { CalendarClock, CreditCard, MapPin, Scissors } from 'lucide-react';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

const BOOK_STEPS: {
  n: string;
  label: string;
  detail: string;
  icon: LucideIcon;
}[] = [
  {
    n: '01',
    label: 'Service',
    detail: 'Blowout, cut, updo, or dry style',
    icon: Scissors,
  },
  {
    n: '02',
    label: 'Time',
    detail: 'Open slots in Chicago local time',
    icon: CalendarClock,
  },
  {
    n: '03',
    label: 'Address',
    detail: 'House-call location & door notes',
    icon: MapPin,
  },
  {
    n: '04',
    label: 'Checkout',
    detail: 'Summary, credits, and secure pay',
    icon: CreditCard,
  },
];

/** Hairline bento grid — feature quote + four-step booking breakdown. */
export function MysticFeatureBento({ className }: Props) {
  return (
    <div
      className={cn(
        'grid gap-px overflow-hidden rounded-2xl border border-line/60 bg-line/60 shadow-[0_24px_60px_-40px_rgba(26,31,24,0.35)] md:grid-cols-3 md:grid-rows-2',
        className
      )}
    >
      <figure className="relative overflow-hidden bg-surface md:col-span-2 md:row-span-2 md:min-h-[19rem]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mystic-pattern-surface-card opacity-[0.55]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gold/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-accent/15 blur-3xl"
        />

        <div className="relative z-10 flex h-full flex-col gap-8 p-6 md:p-8">
          <div className="max-w-xl">
            <p className="type-eyebrow text-plum">House-call booking</p>
            <hr className="mystic-editorial-rule mt-4 max-w-[9rem]" />
            <blockquote className="type-pull mt-5 text-ink">
              Four steps to book — service, time, address, and checkout.
            </blockquote>
            <p className="mt-3 text-sm leading-relaxed text-muted md:text-[0.9375rem]">
              One clear path from pick-a-service to confirmed — inspo photos, member credits, and
              referral names fold in before you pay.
            </p>
          </div>

          <ol className="grid gap-2.5 sm:grid-cols-2">
            {BOOK_STEPS.map(({ n, label, detail, icon: Icon }) => (
              <li
                key={n}
                className="flex items-start gap-3 rounded-xl border border-line/70 bg-paper/85 p-3.5 shadow-[0_8px_24px_-18px_rgba(26,31,24,0.2)] backdrop-blur-[2px]"
              >
                <span className="type-eyebrow mt-0.5 shrink-0 text-gold">{n}</span>
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-plum/8 text-plum">
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{label}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted">{detail}</span>
                </span>
              </li>
            ))}
          </ol>

          <figcaption className="flex flex-col gap-4 border-t border-line/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="type-eyebrow text-muted">Mystic Hair Co. · house calls</p>
            <MysticMagneticLink href="/book" size="sm">
              Start booking
            </MysticMagneticLink>
          </figcaption>
        </div>
      </figure>

      <div className="relative overflow-hidden bg-paper p-5 md:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold-soft/40 via-transparent to-transparent"
        />
        <div className="relative">
          <p className="type-eyebrow text-gold">Step 1–4</p>
          <p className="mt-2 font-display text-2xl text-ink">Simple booking</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Service → time → address → pay. Progress saves as you go.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden bg-paper p-5 md:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-soft/50 via-transparent to-transparent"
        />
        <div className="relative">
          <p className="type-eyebrow text-gold">Members</p>
          <p className="mt-2 font-display text-2xl text-ink">No surcharges</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Travel & evening fees waived on blowouts when credits apply at checkout.
          </p>
        </div>
      </div>
    </div>
  );
}
