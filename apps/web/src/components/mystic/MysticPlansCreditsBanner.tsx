'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MYSTIC_PLANS_PAGE } from '@template/mystic';

/** Shows active blowout credits for returning clients on the plans page. */
export function MysticPlansCreditsBanner() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    void fetch('/api/mystic/credits/mine')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.credits?.length) {
          setTotal(0);
          return;
        }
        const sum = (data.credits as { blowouts_remaining: number }[]).reduce(
          (n, c) => n + c.blowouts_remaining,
          0
        );
        setTotal(sum);
      })
      .catch(() => setTotal(null));
  }, []);

  if (total === null || total === 0) return null;

  return (
    <div className="mt-8 rounded-2xl border border-gold/35 bg-gold-soft/80 px-5 py-4">
      <p className="type-eyebrow text-plum">{MYSTIC_PLANS_PAGE.returningCreditsTitle}</p>
      <p className="mt-1 font-display text-2xl text-ink">
        {total} blowout credit{total === 1 ? '' : 's'} ready
      </p>
      <p className="mt-2 text-sm text-muted">{MYSTIC_PLANS_PAGE.returningCreditsHint}</p>
      <Link
        href="/book"
        className="type-eyebrow mt-4 inline-block text-accent underline-offset-4 hover:underline"
      >
        {MYSTIC_PLANS_PAGE.bookCta} →
      </Link>
    </div>
  );
}
