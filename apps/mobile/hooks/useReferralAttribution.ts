import { useCallback, useEffect, useState } from 'react';
import {
  captureReferralFromParam,
  clearReferralAttribution,
  readStoredReferralCode,
  writeStoredReferralCode,
} from '../lib/referral-storage';

export function useReferralAttribution(refFromRoute?: string | string[]) {
  const [referralCode, setReferralCodeState] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const raw = Array.isArray(refFromRoute) ? refFromRoute[0] : refFromRoute;
      const fromRoute = raw ? await captureReferralFromParam(raw) : null;
      const code = fromRoute ?? (await readStoredReferralCode());
      if (active) setReferralCodeState(code);
    })();
    return () => {
      active = false;
    };
  }, [refFromRoute]);

  const clearReferralCode = useCallback(() => {
    void clearReferralAttribution();
    setReferralCodeState(null);
  }, []);

  const setReferralCode = useCallback((code: string | null) => {
    void writeStoredReferralCode(code);
    setReferralCodeState(code);
  }, []);

  return { referralCode, clearReferralCode, setReferralCode };
}

export { referralCodeForCheckout, MYSTIC_REFERRAL_QUERY_PARAM } from '@template/mystic';
