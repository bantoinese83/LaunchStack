import Link from 'next/link';
import { BOOKING_PLANS_NUDGE } from '@template/mystic';

/** Visible on the service step so new clients see plans before picking a time. */
export function MysticBookPlansPromo() {
  return (
    <aside className="mb-6 rounded-2xl border border-accent/25 bg-accent-soft/45 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="font-medium text-ink">{BOOKING_PLANS_NUDGE.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{BOOKING_PLANS_NUDGE.body}</p>
      </div>
      <Link
        href="/memberships"
        className="type-eyebrow mt-3 inline-flex shrink-0 rounded-full bg-surface px-4 py-2.5 text-accent shadow-sm transition hover:bg-paper sm:mt-0"
      >
        {BOOKING_PLANS_NUDGE.cta} →
      </Link>
    </aside>
  );
}
