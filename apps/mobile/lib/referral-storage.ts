import * as SecureStore from 'expo-secure-store';
import { MYSTIC_REFERRAL_STORAGE_KEY, normalizeReferralCode } from '@template/mystic';

export async function readStoredReferralCode(): Promise<string | null> {
  try {
    const raw = await SecureStore.getItemAsync(MYSTIC_REFERRAL_STORAGE_KEY);
    return normalizeReferralCode(raw);
  } catch {
    return null;
  }
}

export async function writeStoredReferralCode(code: string | null): Promise<void> {
  try {
    const normalized = normalizeReferralCode(code);
    if (!normalized) {
      await SecureStore.deleteItemAsync(MYSTIC_REFERRAL_STORAGE_KEY);
      return;
    }
    await SecureStore.setItemAsync(MYSTIC_REFERRAL_STORAGE_KEY, normalized);
  } catch {
    /* simulator / storage unavailable */
  }
}

export async function captureReferralFromParam(
  param: string | null | undefined
): Promise<string | null> {
  const normalized = normalizeReferralCode(param ?? null);
  if (normalized) await writeStoredReferralCode(normalized);
  return normalized;
}

export async function clearReferralAttribution(): Promise<void> {
  await writeStoredReferralCode(null);
}
