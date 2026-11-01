'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildReferralInviteUrl, MYSTIC_REFERRAL_SHARE } from '@template/mystic';
import { MysticReferralQr } from '@/components/mystic/MysticReferralQr';
import { MysticMagneticButton } from '@/components/mystic/MysticMagneticButton';

export default function ReferralPrintPage() {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch('/api/mystic/client-profile')
      .then(async (r) => {
        if (r.status === 401) {
          setError('Sign in to print your invite card.');
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        const c = data?.profile?.referral_code as string | undefined;
        if (c) setCode(c);
        else setError('No referral code on your profile yet.');
      })
      .catch(() => setError('Could not load your referral code.'));
  }, []);

  const inviteUrl = useMemo(() => {
    if (!code) return '';
    return buildReferralInviteUrl(window.location.origin, code);
  }, [code]);

  if (error) {
    return <p className="p-8 text-center text-sm text-muted">{error}</p>;
  }

  if (!code) {
    return <p className="p-8 text-center text-sm text-muted">Loading…</p>;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-paper px-8 py-12 text-center print:min-h-0">
      <p className="font-display text-2xl text-ink">Mystic Hair Co.</p>
      <p className="mt-2 text-sm text-muted">House-call hair · Chicago</p>
      <div className="mt-8">
        <MysticReferralQr url={inviteUrl} size={220} label={code} />
      </div>
      <p className="mt-6 text-sm text-muted">{MYSTIC_REFERRAL_SHARE.inviteBody}</p>
      <p className="mt-4 break-all font-mono text-xs text-muted">{inviteUrl}</p>
      <MysticMagneticButton
        type="button"
        className="mt-8 print:hidden"
        onClick={() => window.print()}
      >
        Print card
      </MysticMagneticButton>
    </div>
  );
}
