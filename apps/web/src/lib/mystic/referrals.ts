import type { SupabaseClient } from '@supabase/supabase-js';

function escapeIlike(value: string) {
  return value.replace(/[%_\\]/g, '\\$&');
}

/** Match an existing client profile name to a user id for referral credit. */
export async function resolveReferrerUserIdByName(
  admin: SupabaseClient,
  referrerName: string
): Promise<string | null> {
  const trimmed = referrerName.trim();
  if (trimmed.length < 2) return null;

  const { data, error } = await admin
    .from('profiles')
    .select('id, full_name')
    .ilike('full_name', escapeIlike(trimmed))
    .limit(20);
  if (error) throw error;
  if (!data?.length) return null;

  const exact = data.find((row) => row.full_name?.toLowerCase() === trimmed.toLowerCase());
  return (exact ?? data[0])?.id ?? null;
}

export async function resolveReferrerUserIdByCode(
  admin: SupabaseClient,
  workspaceId: string,
  code: string
): Promise<string | null> {
  const normalized = code.trim().toUpperCase();
  if (normalized.length < 4) return null;

  const { data, error } = await admin
    .from('mystic_client_profiles')
    .select('user_id')
    .eq('workspace_id', workspaceId)
    .eq('referral_code', normalized)
    .maybeSingle();
  if (error) throw error;
  return data?.user_id ?? null;
}

export function generateReferralCode(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const base = Math.abs(hash)
    .toString(36)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  return `MYSTIC${base.slice(0, 5).padEnd(5, 'X')}`;
}
