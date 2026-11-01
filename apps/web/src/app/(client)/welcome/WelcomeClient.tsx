'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, MessageSquareText, TicketPercent } from 'lucide-react';
import {
  MYSTIC_CLIENT_ONBOARDING,
  MYSTIC_ONBOARDING_POLICY_SNIPPETS,
  MYSTIC_ONBOARDING_STEPS,
  MYSTIC_ONBOARDING_CELEBRATION_MS,
  MYSTIC_ONBOARDING_VALUE_PROPS,
  MYSTIC_PLANS_ACCOUNT_NUDGE,
  buildReferralBookPath,
  formatUsPhoneInput,
  getCelebrationContent,
  mysticOnboardingStepIndex,
  nextOnboardingStepAfterIntro,
  resolveInitialOnboardingStep,
  stripUsPhoneDigits,
  type MysticOnboardingStep,
} from '@template/mystic';
import { readStoredReferralCode } from '@/lib/mystic/referral-storage';
import { MysticConfettiBurst } from '@/components/mystic/MysticConfettiBurst';
import { MysticMagneticButton } from '@/components/mystic/MysticMagneticButton';
import { MysticOnboardingProgress } from '@/components/mystic/MysticOnboardingProgress';
import { MysticStylistChip } from '@/components/mystic/MysticStylistChip';
import { mysticInput } from '@/components/mystic/mystic-styles';
import { authorizedFetch } from '@/lib/api/authorized-fetch';
import { submitClientOnboarding } from '@/lib/mystic/client-onboarding-api';

const VALUE_ICONS = {
  door: Home,
  text: MessageSquareText,
  credits: TicketPercent,
} as const;

export function WelcomeClient() {
  const router = useRouter();
  const [step, setStep] = useState<MysticOnboardingStep>('intro');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [marketingSms, setMarketingSms] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const celebrationCopy = useMemo(() => getCelebrationContent('onboarding'), []);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  useEffect(() => {
    void authorizedFetch('/api/mystic/client-profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.profile) return;
        const name = data.profile.full_name?.trim() ?? '';
        const mobile = data.profile.phone ? formatUsPhoneInput(data.profile.phone) : '';
        if (name) setFullName(name);
        if (mobile) setPhone(mobile);
        if (typeof data.profile.marketing_sms === 'boolean') {
          setMarketingSms(data.profile.marketing_sms);
        }
        setStep(resolveInitialOnboardingStep(name, mobile));
      })
      .catch(() => undefined);
  }, []);

  const stepIndex = mysticOnboardingStepIndex(step);
  const phoneDigits = stripUsPhoneDigits(phone);
  const profileValid = fullName.trim().length >= 2 && phoneDigits.length >= 10;

  function goNext() {
    setError(null);
    if (step === 'intro') {
      setStep(nextOnboardingStepAfterIntro(profileValid));
      return;
    }
    if (step === 'profile') {
      if (!profileValid) {
        setError('Add your name and a 10-digit mobile number.');
        return;
      }
      setStep('visit');
    }
  }

  function goBack() {
    setError(null);
    const prev = MYSTIC_ONBOARDING_STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  }

  async function finish(action: 'complete' | 'skip') {
    setBusy(true);
    setError(null);
    const result = await submitClientOnboarding(
      action === 'skip'
        ? { action: 'skip' }
        : {
            action: 'complete',
            fullName: fullName.trim(),
            phone: phoneDigits,
            marketingSms,
          }
    );
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Something went wrong');
      return;
    }
    if (action === 'skip') {
      const storedRef = readStoredReferralCode();
      router.push((storedRef ? buildReferralBookPath(storedRef) : '/book') as '/book');
      router.refresh();
      return;
    }
    setCelebrating(true);
    redirectTimer.current = setTimeout(() => {
      const storedRef = readStoredReferralCode();
      router.push((storedRef ? buildReferralBookPath(storedRef) : '/book') as '/book');
      router.refresh();
    }, MYSTIC_ONBOARDING_CELEBRATION_MS);
  }

  const continueDisabled =
    celebrating ||
    busy ||
    (step === 'profile' && !profileValid) ||
    (step === 'visit' && !profileValid);

  const continueLabel =
    step === 'visit' ? MYSTIC_CLIENT_ONBOARDING.completeCta : MYSTIC_CLIENT_ONBOARDING.continueCta;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      <MysticConfettiBurst active={celebrating} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <MysticOnboardingProgress step={celebrating ? 'visit' : step} />
        </div>
        {!celebrating && step === 'intro' ? (
          <button
            type="button"
            className="shrink-0 pt-1 text-sm font-medium text-muted transition hover:text-ink"
            disabled={busy}
            onClick={() => void finish('skip')}
          >
            {MYSTIC_CLIENT_ONBOARDING.skipCta}
          </button>
        ) : null}
      </div>

      {celebrating ? (
        <section
          className="rounded-2xl bg-surface px-6 py-10 text-center md:px-8"
          role="status"
          aria-live="polite"
        >
          <p className="type-eyebrow text-plum">{celebrationCopy.eyebrow}</p>
          <h2 className="type-display-md mt-2 text-ink">{celebrationCopy.title}</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
            {celebrationCopy.body}
          </p>
          <p className="mt-6 text-sm font-medium text-muted">Opening book…</p>
        </section>
      ) : null}

      {!celebrating && step === 'intro' ? (
        <section className="space-y-6">
          <div className="space-y-2">
            <p className="type-hand-md text-plum">{MYSTIC_CLIENT_ONBOARDING.kicker}</p>
            <h1 className="type-display-md text-ink">{MYSTIC_CLIENT_ONBOARDING.introTitle}</h1>
            <p className="max-w-lg text-sm leading-relaxed text-muted">
              {MYSTIC_CLIENT_ONBOARDING.introLede}
            </p>
          </div>
          <MysticStylistChip size={44} />
          <ul className="space-y-3">
            {MYSTIC_ONBOARDING_VALUE_PROPS.map((item) => {
              const Icon = VALUE_ICONS[item.id];
              return (
                <li
                  key={item.id}
                  className="flex gap-4 rounded-2xl bg-surface px-4 py-4 md:px-5 md:py-5"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-plum">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{item.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">
                      {item.body}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {!celebrating && step === 'profile' ? (
        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-ink">
              {MYSTIC_CLIENT_ONBOARDING.profileTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {MYSTIC_CLIENT_ONBOARDING.profileLede}
            </p>
          </div>
          <label className="type-eyebrow block text-plum">
            Full name
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={mysticInput}
              autoComplete="name"
              required
            />
          </label>
          <label className="type-eyebrow block text-plum">
            Mobile
            <input
              value={phone}
              onChange={(e) => setPhone(formatUsPhoneInput(e.target.value))}
              inputMode="tel"
              placeholder="312-555-0100"
              className={mysticInput}
              autoComplete="tel"
              required
            />
            <span className="mt-1 block text-xs font-normal normal-case text-muted">
              {MYSTIC_CLIENT_ONBOARDING.phoneHint}
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-2xl bg-surface px-4 py-4 text-sm">
            <input
              type="checkbox"
              checked={marketingSms}
              onChange={(e) => setMarketingSms(e.target.checked)}
              className="mt-1"
            />
            <span>{MYSTIC_CLIENT_ONBOARDING.smsLabel}</span>
          </label>
        </section>
      ) : null}

      {!celebrating && step === 'visit' ? (
        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-ink">
              {MYSTIC_CLIENT_ONBOARDING.visitTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {MYSTIC_CLIENT_ONBOARDING.visitLede}
            </p>
            {profileValid ? (
              <p className="mt-3 rounded-xl bg-gold-soft/80 px-3 py-2 text-xs leading-relaxed text-plum">
                {MYSTIC_CLIENT_ONBOARDING.profileOnFileHint}
              </p>
            ) : null}
          </div>
          <ul className="divide-y divide-line/70 overflow-hidden rounded-2xl bg-surface">
            {MYSTIC_ONBOARDING_POLICY_SNIPPETS.map((policy) => (
              <li key={policy.id} className="px-4 py-4 md:px-5">
                <p className="font-medium text-ink">{policy.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{policy.body}</p>
              </li>
            ))}
          </ul>
          <p className="text-center text-sm text-muted">
            {MYSTIC_CLIENT_ONBOARDING.visitPlansNudge}{' '}
            <Link
              href="/memberships"
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              {MYSTIC_PLANS_ACCOUNT_NUDGE.cta}
            </Link>
          </p>
        </section>
      ) : null}

      {error ? (
        <p className="text-center text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {!celebrating ? (
        <div className="sticky bottom-0 -mx-1 border-t border-line/60 bg-paper/95 px-1 py-4 backdrop-blur-sm supports-[backdrop-filter]:bg-paper/80">
          <div className="flex flex-col gap-3 sm:flex-row">
            {stepIndex > 0 ? (
              <MysticMagneticButton
                type="button"
                variant="secondary"
                fullWidth
                disabled={busy}
                onClick={goBack}
              >
                {MYSTIC_CLIENT_ONBOARDING.backCta}
              </MysticMagneticButton>
            ) : null}
            <MysticMagneticButton
              type="button"
              fullWidth
              disabled={continueDisabled}
              onClick={() => (step === 'visit' ? void finish('complete') : goNext())}
            >
              {busy && step === 'visit' ? 'Saving…' : continueLabel}
            </MysticMagneticButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
