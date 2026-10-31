'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MYSTIC_MEMBERSHIPS, MYSTIC_PACKAGES, formatUsd } from '@template/mystic';

export function MembershipsClient() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function checkoutMembership(id: string) {
    setLoading(id);
    setError(null);
    const res = await fetch('/api/mystic/checkout/membership', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ membershipId: id }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setError(data.error ?? 'Checkout failed');
      return;
    }
    if (data.url) window.location.href = data.url;
  }

  async function checkoutPackage(id: string) {
    setLoading(id);
    setError(null);
    const res = await fetch('/api/mystic/checkout/package', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: id }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setError(data.error ?? 'Checkout failed');
      return;
    }
    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/" className="text-sm text-muted">
        ← Home
      </Link>
      <h1 className="font-display mt-4 text-3xl font-medium">Memberships & packages</h1>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

      <section className="mt-10 space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Monthly</h2>
        {MYSTIC_MEMBERSHIPS.map((plan) => (
          <article
            key={plan.id}
            className="rounded-2xl border border-accent/40 bg-accent-soft/30 p-6"
          >
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-2xl">{plan.name}</h3>
              <p className="text-lg font-medium">
                {formatUsd(plan.priceCentsMonthly)}
                <span className="text-sm text-muted">/mo</span>
              </p>
            </div>
            <button
              type="button"
              disabled={loading === plan.id}
              onClick={() => checkoutMembership(plan.id)}
              className="mt-4 rounded-full bg-shell px-5 py-2 text-sm text-paper disabled:opacity-50"
            >
              {loading === plan.id ? 'Loading…' : 'Subscribe'}
            </button>
          </article>
        ))}
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Packages</h2>
        {MYSTIC_PACKAGES.map((pack) => (
          <article
            key={pack.id}
            className="flex items-center justify-between rounded-2xl border border-line bg-surface p-5"
          >
            <div>
              <p className="font-medium">{pack.blowoutCount} blowouts</p>
              <p className="text-sm text-muted">{pack.savingsLabel}</p>
            </div>
            <button
              type="button"
              disabled={loading === pack.id}
              onClick={() => checkoutPackage(pack.id)}
              className="rounded-full border border-line px-4 py-2 text-sm disabled:opacity-50"
            >
              {formatUsd(pack.priceCents)}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
