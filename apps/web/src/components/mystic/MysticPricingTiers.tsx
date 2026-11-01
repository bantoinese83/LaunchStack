import Link from 'next/link';
import type { MembershipId, MysticMembership, MysticPackage, PackageId } from '@template/mystic';
import {
  MYSTIC_PLANS_MEMBERSHIP_IMAGE,
  MYSTIC_PLANS_PACKAGES_SECTION_IMAGE,
  MYSTIC_PLANS_PACKAGE_ROW_SERVICE,
  MYSTIC_PLANS_SECTION_IDS,
  MYSTIC_STYLIST,
  formatUsd,
  membershipSubscribeLabel,
  packageBuyAriaLabel,
  packageBuyLabel,
  packageRowTitle,
} from '@template/mystic';
import { MysticMagneticButton, MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticMarketingPhoto } from '@/components/mystic/MysticMarketingPhoto';
import { MysticServiceCardImage } from '@/components/mystic/MysticServiceCardImage';
import { mysticMembershipsHref, mysticPackageCheckoutHref } from '@/lib/mystic/book-links';

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

type SectionIntroProps = {
  imageSrc: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  description: string;
};

function PlansSectionIntro({ imageSrc, imageAlt, eyebrow, title, description }: SectionIntroProps) {
  return (
    <div className="mb-8 grid gap-6 md:mb-10 md:grid-cols-[1fr_min(42%,14rem)] md:items-end md:gap-10">
      <div>
        <h3 className="type-eyebrow text-muted">{eyebrow}</h3>
        <p className="font-display mt-2 text-2xl text-ink md:text-[1.65rem]">{title}</p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted md:text-base">
          {description}
        </p>
      </div>
      <MysticMarketingPhoto
        src={imageSrc}
        alt={imageAlt}
        crop="portrait"
        sizes="(min-width: 768px) 224px, 100vw"
        className="aspect-[3/4] w-full max-w-[12rem] rounded-xl ring-1 ring-line/45 md:ml-auto"
      />
    </div>
  );
}

/**
 * Stacked pricing rows — shared by landing (#memberships) and /memberships checkout.
 */
export function MysticPricingTiers({ memberships, packages, checkout }: Props) {
  return (
    <div className="space-y-16 md:space-y-20">
      <div id={MYSTIC_PLANS_SECTION_IDS.memberships} className="scroll-mt-28">
        <PlansSectionIntro
          eyebrow="Monthly memberships"
          title="Glow & Luxe"
          description="Recurring visits each month — travel and evening fees waived when you book on plan."
          imageSrc={MYSTIC_PLANS_MEMBERSHIP_IMAGE.glow}
          imageAlt={`${MYSTIC_STYLIST.name} on a house call`}
        />
        <ul className="divide-y divide-line/70 border-y border-line/70">
          {memberships.map((plan) => {
            const featured = plan.id === 'luxe';
            const loading = checkout?.loadingId === plan.id;
            return (
              <li
                key={plan.id}
                className="grid gap-6 py-8 md:grid-cols-[7.5rem_1fr_auto] md:items-center md:gap-8 md:py-10"
              >
                <MysticMarketingPhoto
                  src={MYSTIC_PLANS_MEMBERSHIP_IMAGE[plan.id]}
                  alt={`${MYSTIC_STYLIST.name} — ${plan.name} plan`}
                  crop="portrait"
                  sizes="(min-width: 768px) 120px, 88vw"
                  className="aspect-[3/4] w-full max-w-[7.5rem] rounded-lg ring-1 ring-line/45 md:max-w-none"
                />
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
                    {plan.blowoutsPerMonth} visits per month · extra visit{' '}
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
                      {loading ? 'Opening checkout…' : membershipSubscribeLabel(plan.name)}
                    </MysticMagneticButton>
                  ) : (
                    <MysticMagneticLink
                      href={mysticMembershipsHref('memberships')}
                      variant="secondary"
                      size="sm"
                      faceClassName="min-w-[9.5rem]"
                    >
                      {membershipSubscribeLabel(plan.name)}
                    </MysticMagneticLink>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div id={MYSTIC_PLANS_SECTION_IDS.packages} className="scroll-mt-28">
        <PlansSectionIntro
          eyebrow="Prepaid packages"
          title="Try Luke or gift credits"
          description="Pay once — use your visits within six months. Same fee waivers when you book."
          imageSrc={MYSTIC_PLANS_PACKAGES_SECTION_IMAGE}
          imageAlt={`${MYSTIC_STYLIST.name} — house-call stylist`}
        />
        <ul className="divide-y divide-line/70 border-y border-line/70">
          {packages.map((pack) => {
            const loading = checkout?.loadingId === pack.id;
            const priceLabel = formatUsd(pack.priceCents);
            const buyLabel = packageBuyLabel();
            const buyAria = packageBuyAriaLabel(pack.blowoutCount, priceLabel);
            const rowServiceId = MYSTIC_PLANS_PACKAGE_ROW_SERVICE[pack.id];
            return (
              <li
                id={`plan-package-${pack.id}`}
                key={pack.id}
                className="grid gap-5 py-7 md:grid-cols-[9.5rem_1fr_auto] md:items-center md:gap-8 md:py-8"
              >
                <div className="relative aspect-[4/3] w-full max-w-[9.5rem] overflow-hidden rounded-lg ring-1 ring-line/45">
                  <MysticServiceCardImage
                    serviceId={rowServiceId}
                    fill
                    sizes="(min-width: 768px) 152px, 120px"
                    testId={`plan-pack-photo-${pack.id}`}
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
                  <p
                    className="pointer-events-none absolute bottom-2 left-2 font-display text-2xl text-paper drop-shadow-sm"
                    aria-hidden
                  >
                    ×{pack.blowoutCount}
                  </p>
                </div>
                <div>
                  <h4 className="font-display text-xl text-ink md:text-2xl">
                    {packageRowTitle(pack.blowoutCount)}
                  </h4>
                  <p className="mt-1 text-sm text-muted">
                    {formatUsd(pack.pricePerBlowoutCents)} per visit · {pack.savingsLabel} · valid{' '}
                    {pack.expiresMonths} months
                  </p>
                </div>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center md:flex-col md:items-end">
                  <p className="font-display text-2xl text-ink md:text-right">{priceLabel}</p>
                  {checkout ? (
                    <MysticMagneticButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      fullWidth
                      disabled={loading || Boolean(checkout.loadingId)}
                      onClick={() => checkout.onPackage(pack.id)}
                      faceClassName="min-w-[9.5rem]"
                      aria-label={buyAria}
                    >
                      {loading ? 'Opening checkout…' : buyLabel}
                    </MysticMagneticButton>
                  ) : (
                    <MysticMagneticLink
                      href={mysticPackageCheckoutHref(pack.id)}
                      variant="secondary"
                      size="sm"
                      faceClassName="min-w-[9.5rem]"
                      aria-label={buyAria}
                    >
                      {buyLabel}
                    </MysticMagneticLink>
                  )}
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
