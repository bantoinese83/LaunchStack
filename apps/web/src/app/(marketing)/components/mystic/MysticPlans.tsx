import Link from 'next/link';
import { MYSTIC_MEMBERSHIPS, MYSTIC_PACKAGES, formatUsd } from '@template/mystic';

export function MysticPlans() {
  return (
    <section id="memberships" className="border-t border-line px-5 py-14 md:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="type-eyebrow text-gold">Glow & Luxe</p>
        <h2 className="font-display mt-2 text-3xl font-medium tracking-tight text-ink">
          Memberships & packages
        </h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted">Monthly</h3>
            {MYSTIC_MEMBERSHIPS.map((plan) => (
              <article
                key={plan.id}
                className="rounded-2xl border border-accent/30 bg-accent-soft/40 p-6"
              >
                <div className="flex items-baseline justify-between">
                  <h4 className="font-display text-2xl text-ink">{plan.name}</h4>
                  <p className="text-lg font-medium text-ink">
                    {formatUsd(plan.priceCentsMonthly)}
                    <span className="text-sm font-normal text-muted">/mo</span>
                  </p>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {plan.blowoutsPerMonth} blowouts · extra blowouts{' '}
                  {formatUsd(plan.extraBlowoutCents)}
                </p>
                <ul className="mt-4 space-y-1 text-sm text-ink/90">
                  {plan.perks.map((perk) => (
                    <li key={perk}>· {perk}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted">
              Blowout packages
            </h3>
            {MYSTIC_PACKAGES.map((pack) => (
              <article key={pack.id} className="rounded-2xl border border-line bg-surface p-6">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-display text-2xl text-ink">{pack.blowoutCount} blowouts</h4>
                  <p className="text-lg font-medium text-ink">{formatUsd(pack.priceCents)}</p>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {formatUsd(pack.pricePerBlowoutCents)} each · {pack.savingsLabel} · expires in{' '}
                  {pack.expiresMonths} months
                </p>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/book"
            className="inline-flex rounded-full bg-accent px-8 py-3 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Start booking
          </Link>
        </div>
      </div>
    </section>
  );
}
