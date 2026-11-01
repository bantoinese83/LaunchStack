import { requireBrowserSession } from '@/lib/supabase/browser-session';
import type { mysticClientOnboardingSchema } from '@template/validation';
import type { z } from 'zod';
import { authorizedFetch } from '@/lib/api/authorized-fetch';

export type ClientOnboardingPayload = z.infer<typeof mysticClientOnboardingSchema>;

export async function submitClientOnboarding(
  payload: ClientOnboardingPayload
): Promise<{ ok: boolean; error?: string }> {
  const res = await authorizedFetch('/api/mystic/client-profile/onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { error?: string };
  if (!res.ok) return { ok: false, error: data.error ?? 'Could not save' };
  return { ok: true };
}

/**
 * Signed-in: profile onboarding timestamp or null if incomplete.
 * No session: `undefined` (callers should skip the onboarding gate).
 */
export async function fetchOnboardingCompletedAt(): Promise<string | null | undefined> {
  const auth = await requireBrowserSession();
  if (!auth) return undefined;

  const res = await fetch('/api/mystic/client-profile', {
    headers: { Authorization: `Bearer ${auth.session.access_token}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { profile?: { onboarding_completed_at?: string | null } };
  return data.profile?.onboarding_completed_at ?? null;
}
