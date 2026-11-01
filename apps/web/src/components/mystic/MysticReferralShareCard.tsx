'use client';

import { useMemo, useState } from 'react';
import { MYSTIC_REFERRAL_SHARE, buildReferralInviteUrl } from '@template/mystic';
import { MysticReferralQr, referralQrDataUrl } from '@/components/mystic/MysticReferralQr';

type Props = {
  referralCode: string;
  progressCopy?: string | null;
  threshold?: number;
  towardNext?: number;
};

export function MysticReferralShareCard({
  referralCode,
  progressCopy,
  threshold = 5,
  towardNext = 0,
}: Props) {
  const [hint, setHint] = useState<string | null>(null);

  const inviteUrl = useMemo(() => {
    if (typeof window === 'undefined')
      return buildReferralInviteUrl('https://mystichair.co', referralCode);
    return buildReferralInviteUrl(window.location.origin, referralCode);
  }, [referralCode]);

  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      setHint(message);
      setTimeout(() => setHint(null), 2500);
    } catch {
      setHint('Copy manually');
    }
  }

  async function downloadQr() {
    const png = await referralQrDataUrl(inviteUrl, 640);
    const a = document.createElement('a');
    a.href = png;
    a.download = `mystic-invite-${referralCode}.png`;
    a.click();
  }

  function printCard() {
    window.open(`/account/referral-print`, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="rounded-2xl bg-gold-soft/90 px-4 py-5 text-sm">
      <p className="type-eyebrow text-plum">{MYSTIC_REFERRAL_SHARE.inviteTitle}</p>
      <p className="mt-1 text-muted">{MYSTIC_REFERRAL_SHARE.inviteBody}</p>

      <div className="mt-5 flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <MysticReferralQr url={inviteUrl} size={140} label={referralCode} />
        <div className="grid w-full max-w-md grid-cols-2 gap-2 sm:max-w-lg lg:ml-auto lg:max-w-xl lg:pt-1">
          <button
            type="button"
            onClick={() => void copy(inviteUrl, 'Link copied')}
            className="rounded-full border border-line/80 bg-paper px-4 py-2 text-xs font-medium text-ink hover:bg-surface"
          >
            {MYSTIC_REFERRAL_SHARE.copyLink}
          </button>
          <button
            type="button"
            onClick={() => void copy(referralCode, 'Code copied')}
            className="rounded-full border border-line/80 bg-paper px-4 py-2 text-xs font-medium text-ink hover:bg-surface"
          >
            {MYSTIC_REFERRAL_SHARE.copyCode}
          </button>
          <button
            type="button"
            onClick={() => void downloadQr()}
            className="rounded-full border border-line/80 bg-paper px-4 py-2 text-xs font-medium text-ink hover:bg-surface"
          >
            {MYSTIC_REFERRAL_SHARE.downloadQr}
          </button>
          <button
            type="button"
            onClick={printCard}
            className="rounded-full border border-line/80 bg-paper px-4 py-2 text-xs font-medium text-ink hover:bg-surface"
          >
            {MYSTIC_REFERRAL_SHARE.printCard}
          </button>
        </div>
      </div>

      {hint ? <p className="mt-3 text-center text-xs text-plum">{hint}</p> : null}

      {progressCopy ? (
        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-line/70">
            <div
              className="h-full rounded-full bg-gold transition-[width] duration-500"
              style={{
                width: `${Math.min(100, (towardNext / Math.max(1, threshold)) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">{progressCopy}</p>
        </div>
      ) : null}
    </div>
  );
}
