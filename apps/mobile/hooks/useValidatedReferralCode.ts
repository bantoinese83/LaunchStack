import { useEffect, useState } from 'react';
import { clearReferralAttribution } from '../lib/referral-storage';

const appUrl = process.env.EXPO_PUBLIC_APP_URL?.replace(/\/$/, '') ?? '';

type ValidatedState = 'checking' | 'valid' | 'invalid';

export function useValidatedReferralCode(code: string | null) {
  const [entry, setEntry] = useState<{ code: string; state: ValidatedState } | null>(null);

  const state: ValidatedState | 'idle' = !code
    ? 'idle'
    : entry?.code === code
      ? entry.state
      : 'checking';

  useEffect(() => {
    if (!code) return;
    if (!appUrl) {
      setEntry({ code, state: 'invalid' });
      return;
    }

    let active = true;

    void fetch(`${appUrl}/api/mystic/public/referral/${encodeURIComponent(code)}`)
      .then(async (res) => res.json() as Promise<{ valid?: boolean }>)
      .then((data) => {
        if (!active) return;
        if (data.valid) {
          setEntry({ code, state: 'valid' });
          return;
        }
        setEntry({ code, state: 'invalid' });
        void clearReferralAttribution();
      })
      .catch(() => {
        if (!active) return;
        setEntry({ code, state: 'invalid' });
        void clearReferralAttribution();
      });

    return () => {
      active = false;
    };
  }, [code]);

  return {
    referralApplied: state === 'valid',
    referralChecking: state === 'checking',
    referralRejected: state === 'invalid',
  };
}
