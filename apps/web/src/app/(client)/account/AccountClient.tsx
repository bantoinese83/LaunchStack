'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { MysticProfileAvatar } from '@/components/mystic/MysticProfileAvatar';
import { MysticMagneticButton } from '@/components/mystic/MysticMagneticButton';
import { MysticSalonLoader } from '@/components/mystic/MysticSalonLoader';
import { mysticInput } from '@/components/mystic/mystic-styles';
import { MysticReferralShareCard } from '@/components/mystic/MysticReferralShareCard';
import {
  MYSTIC_ACCOUNT_PAGE,
  MYSTIC_PLANS_ACCOUNT_NUDGE,
  formatUsPhoneInput,
  stripUsPhoneDigits,
} from '@template/mystic';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';
import { signOutFromBrowser } from '@/lib/supabase/browser-session';

type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  birthday: string;
  marketingSms: boolean;
  marketingEmail: boolean;
};

type ClientProfileResponse = {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  birthday?: string | null;
  marketing_sms?: boolean;
  marketing_email?: boolean;
  referral_code?: string | null;
  avatar_url?: string | null;
};

type ReferralProgress = {
  pending: number;
  threshold: number;
  towardNext: number;
  untilReward: number;
  copy: string;
};

export function AccountClient({ initialEmail }: { initialEmail: string | null }) {
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>({
    fullName: '',
    email: initialEmail ?? '',
    phone: '',
    birthday: '',
    marketingSms: true,
    marketingEmail: true,
  });
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralProgress, setReferralProgress] = useState<ReferralProgress | null>(null);
  const [creditsSummary, setCreditsSummary] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const loadProfile = useCallback(() => {
    setLoadError(null);
    void fetch('/api/mystic/client-profile')
      .then(async (r) => {
        if (r.status === 401) {
          router.push('/login?next=/account');
          return null;
        }
        const data = await r.json();
        if (!r.ok) {
          setLoadError(data.error ?? 'Could not load profile');
          return null;
        }
        return data as { profile?: ClientProfileResponse; referralProgress?: ReferralProgress };
      })
      .then(
        (data: { profile?: ClientProfileResponse; referralProgress?: ReferralProgress } | null) => {
          if (!data?.profile) return;
          const p = data.profile;
          setForm({
            fullName: p.full_name?.trim() || '',
            email: p.email?.trim() || initialEmail || '',
            phone: p.phone ? formatUsPhoneInput(p.phone) : '',
            birthday: p.birthday ?? '',
            marketingSms: p.marketing_sms ?? true,
            marketingEmail: p.marketing_email ?? true,
          });
          setReferralCode(p.referral_code ?? null);
          setReferralProgress(data.referralProgress ?? null);
          setAvatarUrl(p.avatar_url ?? null);
        }
      )
      .catch(() => setLoadError('Network error — check your connection'))
      .finally(() => setLoading(false));
  }, [initialEmail, router]);

  useDeferredEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useDeferredEffect(() => {
    void fetch('/api/mystic/credits/mine')
      .then((r) => r.json())
      .then((data) => {
        const credits = data.credits ?? [];
        if (!credits.length) return;
        const total = credits.reduce(
          (sum: number, c: { blowouts_remaining: number }) => sum + c.blowouts_remaining,
          0
        );
        if (total > 0) {
          setCreditsSummary(`${total} blowout credit${total === 1 ? '' : 's'} active`);
        }
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/mystic/client-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: stripUsPhoneDigits(form.phone),
          birthday: form.birthday || undefined,
          marketingSms: form.marketingSms,
          marketingEmail: form.marketingEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ kind: 'error', text: data.error ?? 'Could not save' });
        setSavedFlash(false);
        return;
      }
      setStatus({ kind: 'ok', text: 'Profile saved' });
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 4000);
      if (data.profile?.referral_code) setReferralCode(data.profile.referral_code);
      if (data.profile?.phone) {
        setForm((prev) => ({
          ...prev,
          phone: formatUsPhoneInput(String(data.profile.phone)),
        }));
      }
    } catch {
      setStatus({ kind: 'error', text: 'Network error — try again' });
    } finally {
      setSaving(false);
    }
  }

  const phoneDigits = stripUsPhoneDigits(form.phone);
  const profileIncomplete = useMemo(
    () => !loading && (!form.fullName.trim() || phoneDigits.length < 10),
    [form.fullName, loading, phoneDigits.length]
  );

  async function signOut() {
    setSigningOut(true);
    try {
      await signOutFromBrowser();
      router.push('/login');
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  if (loading) {
    return <MysticSalonLoader copyKey="profile" className="py-8" />;
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-line/70 bg-surface px-5 py-8 text-center">
        <p className="text-sm text-danger">{loadError}</p>
        <MysticMagneticButton type="button" className="mt-4" onClick={() => loadProfile()}>
          Try again
        </MysticMagneticButton>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-8">
      {profileIncomplete ? (
        <p
          className="rounded-xl border border-gold/35 bg-gold-soft/70 px-4 py-3 text-sm text-ink"
          role="status"
        >
          {MYSTIC_ACCOUNT_PAGE.incompleteHint}
        </p>
      ) : null}
      {referralCode ? (
        <MysticReferralShareCard
          referralCode={referralCode}
          progressCopy={referralProgress?.copy}
          threshold={referralProgress?.threshold}
          towardNext={referralProgress?.towardNext}
        />
      ) : null}

      {creditsSummary ? (
        <p className="rounded-xl bg-surface px-4 py-3 text-sm text-chalk md:px-5">
          {creditsSummary}
        </p>
      ) : (
        <Link
          href="/memberships"
          className="block rounded-2xl border border-accent/25 bg-accent-soft/40 px-4 py-4 transition hover:border-accent/45 md:px-6 md:py-5"
        >
          <p className="font-medium text-ink">{MYSTIC_PLANS_ACCOUNT_NUDGE.title}</p>
          <p className="mt-1 max-w-2xl text-sm text-muted">{MYSTIC_PLANS_ACCOUNT_NUDGE.body}</p>
          <p className="type-eyebrow mt-3 text-accent">{MYSTIC_PLANS_ACCOUNT_NUDGE.cta} →</p>
        </Link>
      )}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="type-eyebrow block text-plum sm:col-span-2">
              Full name
              <input
                className={mysticInput}
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                autoComplete="name"
                required
              />
            </label>
            <label className="type-eyebrow block text-plum">
              Email
              <input
                type="email"
                className={mysticInput}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
                required
              />
            </label>
            <label className="type-eyebrow block text-plum">
              Mobile (SMS for on-the-way & arrival updates)
              <input
                type="tel"
                className={mysticInput}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: formatUsPhoneInput(e.target.value) })}
                autoComplete="tel"
                placeholder="312-555-0100"
                inputMode="tel"
                required
              />
            </label>
            <label className="type-eyebrow block text-plum sm:col-span-2 md:col-span-1">
              Birthday (optional — Luke sends a little thank-you)
              <input
                type="date"
                className={mysticInput}
                value={form.birthday}
                onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              />
            </label>
          </div>

          <fieldset className="space-y-3 rounded-2xl bg-surface px-4 py-4 md:px-5 md:py-5">
            <legend className="type-eyebrow text-plum">Notifications</legend>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.marketingSms}
                onChange={(e) => setForm({ ...form, marketingSms: e.target.checked })}
              />
              <span>
                Text me appointment updates (on the way, arrival, confirmations). Turn off anytime.
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.marketingEmail}
                onChange={(e) => setForm({ ...form, marketingEmail: e.target.checked })}
              />
              <span>Email me offers & reminders</span>
            </label>
          </fieldset>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <MysticMagneticButton type="submit" disabled={saving} aria-busy={saving}>
              {saving ? 'Saving…' : 'Save profile'}
            </MysticMagneticButton>
            {savedFlash && status?.kind === 'ok' ? (
              <div
                className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-soft/50 px-4 py-2.5 text-sm font-medium text-ink"
                role="status"
              >
                <CheckCircle2 className="size-5 shrink-0 text-accent" aria-hidden />
                {status.text}
              </div>
            ) : status && status.kind === 'error' ? (
              <p className="text-sm text-danger" role="alert">
                {status.text}
              </p>
            ) : null}
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <div className="rounded-2xl bg-surface/80 px-4 py-6 md:px-5">
            <MysticProfileAvatar
              avatarUrl={avatarUrl}
              name={form.fullName}
              diceBearDefaultSeed={form.fullName || form.email}
              onUploaded={setAvatarUrl}
              size={128}
            />
          </div>

          <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1" aria-label="Account shortcuts">
            <Link
              href="/visits"
              className="rounded-xl bg-surface px-4 py-3 text-center text-sm font-medium text-plum transition hover:bg-accent-soft/60 lg:text-left"
            >
              My visits
            </Link>
            <Link
              href="/messages"
              className="rounded-xl bg-surface px-4 py-3 text-center text-sm font-medium text-plum transition hover:bg-accent-soft/60 lg:text-left"
            >
              Messages
            </Link>
            <Link
              href="/book"
              className="rounded-xl bg-surface px-4 py-3 text-center text-sm font-medium text-plum transition hover:bg-accent-soft/60 lg:text-left"
            >
              Book again
            </Link>
            <Link
              href="/memberships"
              className="rounded-xl bg-surface px-4 py-3 text-center text-sm font-medium text-plum transition hover:bg-accent-soft/60 lg:text-left"
            >
              Plans & packages
            </Link>
          </nav>

          <div className="border-t border-line/60 pt-4">
            <MysticMagneticButton
              type="button"
              variant="secondary"
              fullWidth
              disabled={signingOut}
              onClick={() => void signOut()}
            >
              {signingOut ? 'Signing out…' : 'Sign out'}
            </MysticMagneticButton>
          </div>
        </aside>
      </div>
    </form>
  );
}
