'use client';

import { useEffect, useState } from 'react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MYSTIC_REFERRAL_QUERY_PARAM } from '@template/mystic';
import { clearReferralAttribution } from '@/lib/mystic/referral-storage';

type ValidatedState = 'checking' | 'valid' | 'invalid';

/** Server-validates a stored or URL referral code before showing “applied” UI. */
export function useValidatedReferralCode(code: string | null) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [entry, setEntry] = useState<{ code: string; state: ValidatedState } | null>(null);

  const state: ValidatedState | 'idle' = !code
    ? 'idle'
    : entry?.code === code
      ? entry.state
      : 'checking';

  useEffect(() => {
    if (!code) return;

    let active = true;

    void fetch(`/api/mystic/public/referral/${encodeURIComponent(code)}`)
      .then(async (res) => res.json() as Promise<{ valid?: boolean }>)
      .then((data) => {
        if (!active) return;
        if (data.valid) {
          setEntry({ code, state: 'valid' });
          return;
        }
        setEntry({ code, state: 'invalid' });
        clearReferralAttribution();
        if (searchParams.get(MYSTIC_REFERRAL_QUERY_PARAM)) {
          const next = new URLSearchParams(searchParams.toString());
          next.delete(MYSTIC_REFERRAL_QUERY_PARAM);
          const qs = next.toString();
          router.replace((qs ? `${pathname}?${qs}` : pathname) as Route);
        }
      })
      .catch(() => {
        if (!active) return;
        setEntry({ code, state: 'invalid' });
        clearReferralAttribution();
      });

    return () => {
      active = false;
    };
  }, [code, pathname, router, searchParams]);

  return {
    referralApplied: state === 'valid',
    referralChecking: state === 'checking',
    referralRejected: state === 'invalid',
  };
}
