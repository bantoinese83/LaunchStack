'use client';

import { MYSTIC_REFERRAL_STORAGE_KEY, normalizeReferralCode } from '@template/mystic';

const REFERRAL_STORE_EVENT = 'mystic-referral-storage';

export function notifyReferralStore() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(REFERRAL_STORE_EVENT));
}

export function readStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return normalizeReferralCode(window.localStorage.getItem(MYSTIC_REFERRAL_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeStoredReferralCode(code: string | null) {
  if (typeof window === 'undefined') return;
  try {
    const normalized = normalizeReferralCode(code);
    if (!normalized) {
      window.localStorage.removeItem(MYSTIC_REFERRAL_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(MYSTIC_REFERRAL_STORAGE_KEY, normalized);
  } catch {
    /* private mode */
  }
}

export function captureReferralFromSearchParam(param: string | null | undefined): string | null {
  const normalized = normalizeReferralCode(param ?? null);
  if (normalized) writeStoredReferralCode(normalized);
  return normalized;
}

export function clearReferralAttribution() {
  writeStoredReferralCode(null);
  notifyReferralStore();
}
