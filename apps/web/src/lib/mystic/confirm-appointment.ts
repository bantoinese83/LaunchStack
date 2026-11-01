import type { SupabaseClient } from '@supabase/supabase-js';
import { MysticCreditsService } from '@template/api';
import { notifyBookingConfirmed } from '@/lib/mystic/notifications';
import { applyReferralRewardsIfDue } from '@/lib/mystic/referral-rewards';

/** After appointment is confirmed (Stripe or credit-only). Idempotent credit consume. */
export async function onMysticAppointmentConfirmed(admin: SupabaseClient, appointmentId: string) {
  const { data: appt, error } = await admin
    .from('mystic_appointments')
    .select('*')
    .eq('id', appointmentId)
    .single();
  if (error || !appt) return;

  if (appt.entitlement === 'membership' || appt.entitlement === 'package') {
    if (appt.service_id === 'blowout') {
      await new MysticCreditsService(admin).consumeBlowoutForAppointment({
        workspaceId: appt.workspace_id,
        userId: appt.client_user_id,
        entitlement: appt.entitlement,
        appointmentId: appt.id,
      });
    }
  }

  const { data: profile } = await admin
    .from('mystic_client_profiles')
    .select('phone, marketing_sms, marketing_email')
    .eq('user_id', appt.client_user_id)
    .maybeSingle();

  const { data: authProfile } = await admin
    .from('profiles')
    .select('email')
    .eq('id', appt.client_user_id)
    .maybeSingle();

  const whenLabel = new Date(appt.starts_at as string).toLocaleString();
  const email = authProfile?.email;
  if (email) {
    try {
      await notifyBookingConfirmed({
        email,
        phone: profile?.phone ?? undefined,
        whenLabel,
        // Honour "Text me appointment updates" — this used to be
        // `Boolean(profile?.phone)`, so the opt-out was ignored.
        smsOptIn: profile?.marketing_sms !== false,
        transactionalSms: profile?.marketing_sms !== false,
      });
    } catch {
      /* Brevo/Twilio optional until env set */
    }
  }

  await applyReferralRewardsIfDue(admin, appt.workspace_id);
}
