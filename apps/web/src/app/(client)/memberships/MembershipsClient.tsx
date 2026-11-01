'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MYSTIC_MEMBERSHIPS,
  MYSTIC_PACKAGES,
  MYSTIC_PLANS_PAGE,
  MYSTIC_PLANS_TRUST,
  type MembershipId,
  type PackageId,
} from '@template/mystic';
import { parsePackageParam } from '@/lib/mystic/book-links';
import { Alert } from '@template/ui';
import { MysticClientPage } from '@/components/mystic/MysticClientPage';
import { MysticPageIntro } from '@/components/mystic/MysticPageIntro';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticPricingTiers } from '@/components/mystic/MysticPricingTiers';
import { MysticPlansChooser } from '@/components/mystic/MysticPlansChooser';
import { MysticPlansHouseCallStrip } from '@/components/mystic/MysticPlansHouseCallStrip';
import { MysticPlansCreditsBanner } from '@/components/mystic/MysticPlansCreditsBanner';
import { MysticPatternBand, mysticPatternBandEyebrow } from '@/components/mystic/MysticPatternBand';
import { mysticEyebrow, mysticSectionTitle } from '@/components/mystic/mystic-styles';
import { MysticStripeEncryptedFootnote } from '@/components/mystic/MysticStripeWordmark';

export function MembershipsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const packageId = parsePackageParam(searchParams.get('package'));
    if (!packageId) return;
    const row = document.getElementById(`plan-package-${packageId}`);
    if (!row) return;
    const timer = window.setTimeout(() => {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  async function checkoutMembership(id: MembershipId) {
    setLoading(id);
    setError(null);
    const res = await fetch('/api/mystic/checkout/membership', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ membershipId: id }),
    });
    const data = await res.json();
    setLoading(null);
    if (res.status === 401) {
      router.push('/login?next=/memberships');
      return;
    }
    if (!res.ok) {
      setError(data.error ?? 'Checkout failed');
      return;
    }
    if (data.url) window.location.href = data.url;
  }

  async function checkoutPackage(id: PackageId) {
    setLoading(id);
    setError(null);
    const res = await fetch('/api/mystic/checkout/package', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: id }),
    });
    const data = await res.json();
    setLoading(null);
    if (res.status === 401) {
      router.push('/login?next=/memberships');
      return;
    }
    if (!res.ok) {
      setError(data.error ?? 'Checkout failed');
      return;
    }
    if (data.url) window.location.href = data.url;
  }

  return (
    <MysticClientPage width="wide" loose>
      <MysticPageIntro
        eyebrow={MYSTIC_PLANS_PAGE.eyebrow}
        title={MYSTIC_PLANS_PAGE.title}
        description={MYSTIC_PLANS_PAGE.description}
        className="max-w-2xl"
      />

      <ul className="flex flex-wrap gap-x-8 gap-y-2 border-y border-line/60 py-4">
        {MYSTIC_PLANS_TRUST.map((item) => (
          <li key={item} className={`${mysticEyebrow} text-muted`}>
            {item}
          </li>
        ))}
      </ul>

      <MysticPlansCreditsBanner />
      <MysticPlansChooser />
      <MysticPlansHouseCallStrip />

      {error ? (
        <Alert className="mt-6" variant="error">
          {error}
        </Alert>
      ) : null}

      <div className="mt-12">
        <MysticPricingTiers
          memberships={MYSTIC_MEMBERSHIPS}
          packages={MYSTIC_PACKAGES}
          checkout={{
            loadingId: loading,
            onMembership: checkoutMembership,
            onPackage: checkoutPackage,
          }}
        />
      </div>

      <MysticPatternBand>
        <p className={mysticPatternBandEyebrow}>Ready when you are</p>
        <h2 className={`${mysticSectionTitle} mt-2 text-paper`}>
          Use your credits on a house call
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-paper/80 md:text-base">
          Pick a time that works — member and package blowouts skip travel and evening fees at
          checkout.
        </p>
        <div className="mt-8">
          <MysticMagneticLink href="/book" surface="dark">
            {MYSTIC_PLANS_PAGE.bookCta}
          </MysticMagneticLink>
        </div>
      </MysticPatternBand>

      <MysticStripeEncryptedFootnote className="mt-10" tail="Manage plans in your account" />

      <p className="mt-6 text-center">
        <Link href="/account" className="type-eyebrow text-muted transition hover:text-ink">
          View billing in account →
        </Link>
      </p>
    </MysticClientPage>
  );
}
