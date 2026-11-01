'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  MYSTIC_REFERRAL_SHARE,
  buildReferralBookPath,
  buildReferralSignupPath,
} from '@template/mystic';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticReferralQr } from '@/components/mystic/MysticReferralQr';
import { writeStoredReferralCode } from '@/lib/mystic/referral-storage';

type Props = {
  code: string;
  valid: boolean;
  referrerFirstName?: string;
  inviteUrl: string;
};

export function ReferralInviteClient({ code, valid, referrerFirstName, inviteUrl }: Props) {
  useEffect(() => {
    if (valid) writeStoredReferralCode(code);
  }, [code, valid]);

  const bookHref = valid ? buildReferralBookPath(code) : '/book';
  const signupHref = valid ? buildReferralSignupPath(code) : '/signup';

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <p className="type-eyebrow text-plum">Mystic Hair Co.</p>
      <h1 className="font-display mt-2 text-3xl font-medium tracking-tight text-ink">
        {valid ? `${referrerFirstName} invited you` : 'House-call hair in Chicago'}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {valid
          ? 'Book a blowout, cut, or updo at your door — your visit helps them earn rewards.'
          : 'This invite link may be outdated. You can still book a house call anytime.'}
      </p>

      {valid ? (
        <div className="mt-8">
          <MysticReferralQr url={inviteUrl} size={168} label={code} />
        </div>
      ) : null}

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <MysticMagneticLink href={bookHref as Route} fullWidth>
          Book a house call
        </MysticMagneticLink>
        <Link
          href={signupHref as Route}
          className="text-sm font-medium text-accent underline-offset-2 hover:underline"
        >
          Create an account
        </Link>
      </div>

      {valid ? (
        <p className="mt-6 text-xs text-muted">
          Referral code <span className="font-mono text-ink">{code}</span> saves automatically when
          you book.
        </p>
      ) : (
        <p className="mt-6 text-xs text-muted">{MYSTIC_REFERRAL_SHARE.inviteBody}</p>
      )}
    </div>
  );
}
