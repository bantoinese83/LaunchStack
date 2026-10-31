import type { SupabaseClient } from '@supabase/supabase-js';
import { MysticReferralService } from '@template/api';

/** Idempotent — records referral once booking is confirmed (paid or credit). */
export async function recordReferralOnBookingConfirmed(
  admin: SupabaseClient,
  input: {
    workspaceId: string;
    appointmentId: string;
    clientUserId: string;
    referrerUserId: string;
    referredName: string;
  }
) {
  if (!input.referrerUserId || input.referrerUserId === input.clientUserId) return;

  const { data: existing } = await admin
    .from('mystic_referrals')
    .select('id')
    .eq('appointment_id', input.appointmentId)
    .maybeSingle();
  if (existing) return;

  await new MysticReferralService(admin).recordReferral({
    workspaceId: input.workspaceId,
    referrerUserId: input.referrerUserId,
    referredName: input.referredName,
    referredUserId: input.clientUserId,
    appointmentId: input.appointmentId,
  });
}
