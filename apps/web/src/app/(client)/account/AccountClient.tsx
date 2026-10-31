'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MysticProfileAvatar } from '@/components/mystic/MysticProfileAvatar';
import { MysticMagneticButton } from '@/components/mystic/MysticMagneticButton';
import { mysticFlatRow, mysticInput } from '@/components/mystic/mystic-styles';

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [creditsSummary, setCreditsSummary] = useState<string | null>(null);
  const [copyHint, setCopyHint] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const loadProfile = useCallback(() => {
    void fetch('/api/mystic/client-profile')
      .then(async (r) => {
        if (r.status === 401) {
          router.push('/login?next=/account');
          return null;
        }
        const data = await r.json();
        if (!r.ok) {
          setStatus({ kind: 'error', text: data.error ?? 'Could not load profile' });
          return null;
        }
        return data as { profile?: ClientProfileResponse };
      })
      .then((data: { profile?: ClientProfileResponse } | null) => {
        if (!data?.profile) return;
        const p = data.profile;
        setForm({
          fullName: p.full_name?.trim() || '',
          email: p.email?.trim() || initialEmail || '',
          phone: p.phone ?? '',
          birthday: p.birthday ?? '',
          marketingSms: p.marketing_sms ?? true,
          marketingEmail: p.marketing_email ?? true,
        });
        setReferralCode(p.referral_code ?? null);
        setAvatarUrl(p.avatar_url ?? null);
      })
      .finally(() => setLoading(false));
  }, [initialEmail, router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
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
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ kind: 'error', text: data.error ?? 'Could not save' });
        return;
      }
      setStatus({ kind: 'ok', text: 'Profile saved' });
      if (data.profile?.referral_code) setReferralCode(data.profile.referral_code);
    } catch {
      setStatus({ kind: 'error', text: 'Network error — try again' });
    } finally {
      setSaving(false);
    }
  }

  async function copyReferral() {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopyHint('Copied');
      setTimeout(() => setCopyHint(null), 2000);
    } catch {
      setCopyHint('Copy manually');
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 border-y border-line/80 py-6" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-10 animate-pulse border-b border-line/40 bg-line/20" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-5">
      {referralCode ? (
        <div className="border-l-[3px] border-gold bg-gold-soft/90 py-3 pl-4 text-sm">
          <p className="text-muted">
            Share with friends — you both earn rewards after their visit.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="font-mono text-base font-medium text-ink">{referralCode}</span>
            <button
              type="button"
              onClick={() => void copyReferral()}
              className="border-b border-plum/40 px-1 py-0.5 text-xs font-medium text-plum"
            >
              {copyHint ?? 'Copy code'}
            </button>
          </div>
        </div>
      ) : null}
      {creditsSummary ? (
        <p className={`${mysticFlatRow} text-sm text-chalk`}>{creditsSummary}</p>
      ) : null}

      <MysticProfileAvatar
        avatarUrl={avatarUrl}
        name={form.fullName}
        diceBearDefaultSeed={form.fullName || form.email}
        onUploaded={setAvatarUrl}
      />

      <label className="type-eyebrow block text-plum">
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
        Mobile (SMS for en route & door timer)
        <input
          type="tel"
          className={mysticInput}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          autoComplete="tel"
          placeholder="3125550100"
          required
        />
      </label>
      <label className="type-eyebrow block text-plum">
        Birthday (optional — Luke sends a little thank-you)
        <input
          type="date"
          className={mysticInput}
          value={form.birthday}
          onChange={(e) => setForm({ ...form, birthday: e.target.value })}
        />
      </label>

      <fieldset className={`${mysticFlatRow} space-y-3 border-t border-line/80 pt-5`}>
        <legend className="type-eyebrow text-plum">Notifications</legend>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.marketingSms}
            onChange={(e) => setForm({ ...form, marketingSms: e.target.checked })}
          />
          <span>
            Text me appointment updates (on the way, door timer, confirmations). Turn off anytime.
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

      <MysticMagneticButton type="submit" disabled={saving} aria-busy={saving}>
        {saving ? 'Saving…' : 'Save profile'}
      </MysticMagneticButton>
      {status ? (
        <p className={`text-sm ${status.kind === 'ok' ? 'text-chalk' : 'text-danger'}`}>
          {status.text}
        </p>
      ) : null}

      <nav className="divide-y divide-line/80 border-y border-line/80 text-sm">
        <Link href="/visits" className={`${mysticFlatRow} block font-medium text-plum`}>
          My visits
        </Link>
        <Link href="/messages" className={`${mysticFlatRow} block font-medium text-plum`}>
          Messages
        </Link>
        <Link href="/book" className={`${mysticFlatRow} block font-medium text-plum`}>
          Book again
        </Link>
      </nav>
    </form>
  );
}
