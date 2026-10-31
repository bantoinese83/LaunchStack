import type { SupabaseClient } from '@supabase/supabase-js';

const PROCESSING_STALE_MS = 5 * 60 * 1000;

export type CheckoutIdempotencyClaim =
  | { action: 'proceed' }
  | { action: 'replay'; body: Record<string, unknown> }
  | { action: 'conflict' };

export function readCheckoutIdempotencyKey(
  req: Request,
  body: Record<string, unknown>
): string | undefined {
  const header = req.headers.get('Idempotency-Key')?.trim();
  const field = typeof body.idempotencyKey === 'string' ? body.idempotencyKey.trim() : undefined;
  const key = header || field;
  if (!key || key.length < 8 || key.length > 128) return undefined;
  return key;
}

export async function claimCheckoutIdempotency(
  admin: SupabaseClient,
  clientUserId: string,
  idempotencyKey: string
): Promise<CheckoutIdempotencyClaim> {
  const { data: existing } = await admin
    .from('mystic_checkout_idempotency')
    .select('id, status, response_json, created_at')
    .eq('client_user_id', clientUserId)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'completed' && existing.response_json) {
      return { action: 'replay', body: existing.response_json as Record<string, unknown> };
    }
    const age = Date.now() - new Date(existing.created_at as string).getTime();
    if (existing.status === 'processing' && age < PROCESSING_STALE_MS) {
      return { action: 'conflict' };
    }
    await admin.from('mystic_checkout_idempotency').delete().eq('id', existing.id);
  }

  const { error } = await admin.from('mystic_checkout_idempotency').insert({
    client_user_id: clientUserId,
    idempotency_key: idempotencyKey,
    status: 'processing',
  });

  if (error?.code === '23505') {
    return { action: 'conflict' };
  }
  if (error) throw error;

  return { action: 'proceed' };
}

export async function completeCheckoutIdempotency(
  admin: SupabaseClient,
  clientUserId: string,
  idempotencyKey: string,
  appointmentId: string,
  response: Record<string, unknown>
) {
  await admin
    .from('mystic_checkout_idempotency')
    .update({
      status: 'completed',
      appointment_id: appointmentId,
      response_json: response,
    })
    .eq('client_user_id', clientUserId)
    .eq('idempotency_key', idempotencyKey);
}

export async function releaseCheckoutIdempotency(
  admin: SupabaseClient,
  clientUserId: string,
  idempotencyKey: string
) {
  await admin
    .from('mystic_checkout_idempotency')
    .delete()
    .eq('client_user_id', clientUserId)
    .eq('idempotency_key', idempotencyKey)
    .eq('status', 'processing');
}
