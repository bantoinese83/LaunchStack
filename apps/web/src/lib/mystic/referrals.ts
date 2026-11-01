import type { SupabaseClient } from '@supabase/supabase-js';

function escapeIlike(value: string) {
  return value.replace(/[%_\\]/g, '\\$&');
}

/** Match an existing Mystic client profile name to a user id for referral credit. */
export async function resolveReferrerUserIdByName(
  admin: SupabaseClient,
  referrerName: string,
  workspaceId?: string
): Promise<string | null> {
  const trimmed = referrerName.trim();
  if (trimmed.length < 2) return null;

  const { data, error } = await admin
    .from('profiles')
    .select('id, full_name')
    .ilike('full_name', escapeIlike(trimmed))
    .limit(40);
  if (error) throw error;
  if (!data?.length) return null;

  const exact = data.filter((row) => row.full_name?.toLowerCase() === trimmed.toLowerCase());
  const candidates = exact.length ? exact : data;
  const candidateIds = candidates.map((row) => row.id as string);

  if (!workspaceId) {
    return candidates[0]?.id ?? null;
  }

  const { data: clients, error: clientError } = await admin
    .from('mystic_client_profiles')
    .select('user_id')
    .eq('workspace_id', workspaceId)
    .in('user_id', candidateIds);
  if (clientError) throw clientError;
  if (!clients?.length) return null;

  const clientSet = new Set(clients.map((row) => row.user_id as string));
  const preferred = candidates.find((row) => clientSet.has(row.id as string));
  return preferred?.id ?? null;
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

/** Ensure the client has a mystic profile row with a stable referral code. */
export async function ensureClientReferralCode(
  admin: SupabaseClient,
  input: { userId: string; workspaceId: string }
): Promise<string> {
  const { data: existing, error } = await admin
    .from('mystic_client_profiles')
    .select('referral_code, phone, birthday, marketing_sms, marketing_email, referral_count')
    .eq('user_id', input.userId)
    .maybeSingle();
  if (error) throw error;

  if (existing?.referral_code) return existing.referral_code as string;

  const referralCode = generateReferralCode(`${input.userId}-${input.workspaceId}`);
  const { data, error: upsertError } = await admin
    .from('mystic_client_profiles')
    .upsert(
      {
        user_id: input.userId,
        workspace_id: input.workspaceId,
        phone: existing?.phone ?? null,
        birthday: existing?.birthday ?? null,
        marketing_sms: existing?.marketing_sms ?? true,
        marketing_email: existing?.marketing_email ?? true,
        referral_code: referralCode,
        referral_count: existing?.referral_count ?? 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select('referral_code')
    .single();
  if (upsertError) throw upsertError;
  return (data?.referral_code as string) ?? referralCode;
}
