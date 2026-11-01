'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MYSTIC_CLIENT_ONBOARDING,
  MYSTIC_ONBOARDING_POLICY_SNIPPETS,
  MYSTIC_PLANS_ACCOUNT_NUDGE,
  buildReferralBookPath,
  formatUsPhoneInput,
  stripUsPhoneDigits,
} from '@template/mystic';
import { readStoredReferralCode } from '@/lib/mystic/referral-storage';
import { MysticMagneticButton } from '@/components/mystic/MysticMagneticButton';
import { MysticPageIntro } from '@/components/mystic/MysticPageIntro';
import { MysticStylistChip } from '@/components/mystic/MysticStylistChip';
import { authorizedFetch } from '@/lib/api/authorized-fetch';
import { submitClientOnboarding } from '@/lib/mystic/client-onboarding-api';

export function WelcomeClient() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [marketingSms, setMarketingSms] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void authorizedFetch('/api/mystic/client-profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.profile) return;
        if (data.profile.full_name) setFullName(data.profile.full_name);
        if (data.profile.phone) setPhone(formatUsPhoneInput(data.profile.phone));
        if (typeof data.profile.marketing_sms === 'boolean') {
          setMarketingSms(data.profile.marketing_sms);
        }
      })
      .catch(() => undefined);
  }, []);

  async function finish(action: 'complete' | 'skip') {
    setBusy(true);
    setError(null);
    const result = await submitClientOnboarding(
      action === 'skip'
        ? { action: 'skip' }
        : {
            action: 'complete',
            fullName: fullName.trim(),
            phone: stripUsPhoneDigits(phone),
            marketingSms,
          }
    );
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Something went wrong');
      return;
    }
    const storedRef = readStoredReferralCode();
    router.push((storedRef ? buildReferralBookPath(storedRef) : '/book') as '/book');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <MysticPageIntro
        eyebrow={MYSTIC_CLIENT_ONBOARDING.kicker}
        title={MYSTIC_CLIENT_ONBOARDING.title}
        description={MYSTIC_CLIENT_ONBOARDING.lede}
      />
      <MysticStylistChip size={44} />

      <section className="space-y-4 rounded-2xl bg-surface p-5">
        <h2 className="text-sm font-semibold text-ink">Your details</h2>
        <label className="block text-sm">
          <span className="text-muted">Full name</span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-xl bg-paper px-4 py-3 text-ink outline-none focus:bg-accent-soft/40"
            autoComplete="name"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Mobile</span>
          <input
            value={phone}
            onChange={(e) => setPhone(formatUsPhoneInput(e.target.value))}
            inputMode="tel"
            placeholder="312-555-0100"
            className="mt-1 w-full rounded-xl bg-paper px-4 py-3 text-ink outline-none focus:bg-accent-soft/40"
            autoComplete="tel"
          />
          <span className="mt-1 block text-xs text-muted">
            {MYSTIC_CLIENT_ONBOARDING.phoneHint}
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={marketingSms}
            onChange={(e) => setMarketingSms(e.target.checked)}
            className="mt-1"
          />
          <span>{MYSTIC_CLIENT_ONBOARDING.smsLabel}</span>
        </label>
      </section>

      <section className="space-y-3 rounded-2xl bg-paper/80 p-5 text-sm">
        <h2 className="font-semibold text-ink">{MYSTIC_CLIENT_ONBOARDING.policiesIntro}</h2>
        {MYSTIC_ONBOARDING_POLICY_SNIPPETS.map((policy) => (
          <div key={policy.id}>
            <p className="font-medium text-ink">{policy.title}</p>
            <p className="mt-0.5 leading-relaxed text-muted">{policy.body}</p>
          </div>
        ))}
      </section>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <p className="text-center text-sm text-muted">
        Blowouts every month?{' '}
        <Link
          href="/memberships"
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          {MYSTIC_PLANS_ACCOUNT_NUDGE.cta}
        </Link>
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <MysticMagneticButton
          type="button"
          variant="secondary"
          fullWidth
          disabled={busy}
          onClick={() => void finish('skip')}
        >
          {MYSTIC_CLIENT_ONBOARDING.skipCta}
        </MysticMagneticButton>
        <MysticMagneticButton
          type="button"
          fullWidth
          disabled={busy || fullName.trim().length < 2 || stripUsPhoneDigits(phone).length < 10}
          onClick={() => void finish('complete')}
        >
          {MYSTIC_CLIENT_ONBOARDING.completeCta}
        </MysticMagneticButton>
      </div>
    </div>
  );
}
