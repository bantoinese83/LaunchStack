'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  birthday: string;
  marketingSms: boolean;
  marketingEmail: boolean;
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
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [creditsSummary, setCreditsSummary] = useState<string | null>(null);

  useEffect(() => {
    void fetch('/api/mystic/client-profile')
      .then((r) => {
        if (r.status === 401) {
          router.push('/login?next=/account');
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data?.profile) {
          setLoading(false);
          return;
        }
        const p = data.profile;
        setForm((current) => ({
          ...current,
          phone: p.phone ?? '',
          birthday: p.birthday ?? '',
          marketingSms: p.marketing_sms ?? true,
          marketingEmail: p.marketing_email ?? true,
        }));
        setReferralCode(p.referral_code ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

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
        setCreditsSummary(`${total} blowout credit${total === 1 ? '' : 's'} active`);
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const res = await fetch('/api/mystic/client-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setStatus(res.ok ? 'Saved' : (data.error ?? 'Could not save'));
    if (res.ok && data.profile?.referral_code) setReferralCode(data.profile.referral_code);
  }

  if (loading) {
    return <p className="text-muted">Loading profile…</p>;
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-lg space-y-4">
      {referralCode ? (
        <p className="rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
          Your referral code: <span className="font-mono font-medium">{referralCode}</span>
        </p>
      ) : null}
      {creditsSummary ? <p className="text-sm text-muted">{creditsSummary}</p> : null}
      <label className="block text-sm">
        Full name
        <input
          className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          required
        />
      </label>
      <label className="block text-sm">
        Email
        <input
          type="email"
          className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </label>
      <label className="block text-sm">
        Mobile (SMS updates)
        <input
          type="tel"
          className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
      </label>
      <label className="block text-sm">
        Birthday (optional)
        <input
          type="date"
          className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2"
          value={form.birthday}
          onChange={(e) => setForm({ ...form, birthday: e.target.value })}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.marketingSms}
          onChange={(e) => setForm({ ...form, marketingSms: e.target.checked })}
        />
        Text me appointment updates
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.marketingEmail}
          onChange={(e) => setForm({ ...form, marketingEmail: e.target.checked })}
        />
        Email me offers & reminders
      </label>
      <button type="submit" className="rounded-full bg-shell px-6 py-3 text-sm text-paper">
        Save profile
      </button>
      {status ? <p className="text-sm text-muted">{status}</p> : null}
      <p className="text-sm text-muted">
        <Link href="/visits" className="underline">
          My visits
        </Link>
      </p>
    </form>
  );
}
