import type { SupabaseClient } from '@supabase/supabase-js';
import { MysticAppointmentService } from '@template/api';
import { getStripeClient } from '@/lib/stripe';

export async function captureAppointmentDeposit(
  admin: SupabaseClient,
  appointmentId: string
): Promise<{ captured: boolean; appointmentId: string }> {
  const { data: row } = await admin
    .from('mystic_appointments')
    .select('stripe_payment_intent_id, deposit_cents, deposit_captured')
    .eq('id', appointmentId)
    .single();

  if (!row) {
    throw new Error('Appointment not found');
  }

  let captured = false;
  if (
    row.stripe_payment_intent_id &&
    row.deposit_cents > 0 &&
    !row.deposit_captured &&
    process.env.STRIPE_SECRET_KEY
  ) {
    const stripe = getStripeClient();
    await stripe.paymentIntents.capture(row.stripe_payment_intent_id, {
      amount_to_capture: row.deposit_cents,
    });
    captured = true;
  }

  // Always record the no-show, but only claim the deposit was captured when money
  // actually moved — a false `deposit_captured` both misreports revenue and blocks
  // any later legitimate capture.
  await new MysticAppointmentService(admin).markNoShow(appointmentId, {
    depositCaptured: captured,
  });
  return { captured, appointmentId };
}
