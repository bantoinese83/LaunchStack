'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import { MYSTIC_REFERRAL_QUERY_PARAM, normalizeReferralCode } from '@template/mystic';
import {
  clearReferralAttribution,
  notifyReferralStore,
  readStoredReferralCode,
  writeStoredReferralCode,
} from '@/lib/mystic/referral-storage';

const REFERRAL_STORE_EVENT = 'mystic-referral-storage';

function subscribeReferralStore(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => onStoreChange();
  window.addEventListener(REFERRAL_STORE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(REFERRAL_STORE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

function readReferralSnapshot(): string | null {
  return readStoredReferralCode();
}

export function useReferralAttribution() {
  const searchParams = useSearchParams();
  const refParam = searchParams.get(MYSTIC_REFERRAL_QUERY_PARAM);

  const fromUrl = useMemo(() => normalizeReferralCode(refParam), [refParam]);

  useEffect(() => {
    if (fromUrl) writeStoredReferralCode(fromUrl);
  }, [fromUrl]);

  const stored = useSyncExternalStore(subscribeReferralStore, readReferralSnapshot, () => null);

  const referralCode = fromUrl ?? stored;

  const clearReferralCode = () => clearReferralAttribution();

  const setReferralCode = (code: string | null) => {
    writeStoredReferralCode(code);
    notifyReferralStore();
  };

  return { referralCode, clearReferralCode, setReferralCode };
}

export { referralCodeForCheckout } from '@template/mystic';
