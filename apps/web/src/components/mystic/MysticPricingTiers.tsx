import Link from 'next/link';
import type { MembershipId, MysticMembership, MysticPackage, PackageId } from '@template/mystic';
import { formatUsd } from '@template/mystic';
import { MysticMagneticButton, MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';

export type MysticPricingCheckout = {
  loadingId: string | null;
  onMembership: (id: MembershipId) => void;
  onPackage: (id: PackageId) => void;
};

type Props = {
  memberships: MysticMembership[];
  packages: MysticPackage[];
  checkout?: MysticPricingCheckout;
};

/**
 * Stacked pricing rows — shared by landing (#memberships) and /memberships checkout.
 */
export function MysticPricingTiers({ memberships, packages, checkout }: Props) {
  return (
    <div className="space-y-16">
      <div>
        <h3 className="type-eyebrow text-muted">Monthly memberships</h3>
        <ul className="mt-6 divide-y divide-line/70 border-y border-line/70">
          {memberships.map((plan) => {
            const featured = plan.id === 'luxe';
            const loading = checkout?.loadingId === plan.id;
            return (
              <li
                key={plan.id}
                className="grid gap-6 py-8 md:grid-cols-[1fr_auto] md:items-center md:gap-10 md:py-10"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="type-display-md text-ink">{plan.name}</h4>
                    {featured ? (
                      <span className="type-eyebrow rounded-full bg-plum/10 px-3 py-0.5 text-plum">
                        Most loved
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-muted md:text-base">
                    {plan.blowoutsPerMonth} blowouts per month · extra blowout{' '}
                    {formatUsd(plan.extraBlowoutCents)} · house call only
                  </p>
                  <ul className="mt-4 flex flex-col gap-2 text-sm text-ink/85 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
                    {plan.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-1.5">
                        <span className="text-gold" aria-hidden>
                          ✦
                        </span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center md:flex-col md:items-end">
                  <p className="font-display text-3xl text-ink md:text-right">
                    {formatUsd(plan.priceCentsMonthly)}
                    <span className="text-base font-normal text-muted">/mo</span>
                  </p>
                  {checkout ? (
                    <MysticMagneticButton
                      type="button"
                      size="sm"
                      fullWidth
                      disabled={loading || Boolean(checkout.loadingId)}
                      onClick={() => checkout.onMembership(plan.id)}
                      faceClassName="min-w-[9.5rem]"
                    >
                      {loading ? 'Opening checkout…' : 'Subscribe'}
                    </MysticMagneticButton>
                  ) : (
                    <MysticMagneticLink href="/memberships" variant="secondary" size="sm">
                      View plan
                    </MysticMagneticLink>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="type-eyebrow text-muted">Blowout packages</h3>
        <ul className="mt-6 divide-y divide-line/70 border-y border-line/70">
          {packages.map((pack) => {
            const loading = checkout?.loadingId === pack.id;
            return (
              <li
                key={pack.id}
                className="grid gap-4 py-7 md:grid-cols-[1fr_auto] md:items-center md:gap-10 md:py-8"
              >
                <div>
                  <h4 className="font-display text-xl text-ink md:text-2xl">
                    {pack.blowoutCount} blowouts
                  </h4>
                  <p className="mt-1 text-sm text-muted">
                    {formatUsd(pack.pricePerBlowoutCents)} each · {pack.savingsLabel} · valid{' '}
                    {pack.expiresMonths} months
                  </p>
                </div>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center md:flex-col md:items-end">
                  <p className="font-display text-2xl text-ink md:text-right">
                    {formatUsd(pack.priceCents)}
                  </p>
                  {checkout ? (
                    <MysticMagneticButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      fullWidth
                      disabled={loading || Boolean(checkout.loadingId)}
                      onClick={() => checkout.onPackage(pack.id)}
                      faceClassName="min-w-[9.5rem]"
                    >
                      {loading ? 'Opening checkout…' : 'Buy package'}
                    </MysticMagneticButton>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-8 text-sm leading-relaxed text-muted">
          Refer a friend — both earn rewards after a first completed visit.{' '}
          <Link href="/book" className="text-chalk underline-offset-4 hover:underline">
            Enter a name at checkout
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
