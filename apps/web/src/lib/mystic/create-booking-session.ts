import type { SupabaseClient } from '@supabase/supabase-js';
import { MysticAppointmentService } from '@template/api';
import type Stripe from 'stripe';
import type { MysticCreateAppointmentInput } from '@/lib/mystic/booking-checkout-core';
import { prepareBookingCheckout } from '@/lib/mystic/booking-checkout-core';
import { onMysticAppointmentConfirmed } from '@/lib/mystic/confirm-appointment';
import { recordReferralOnBookingConfirmed } from '@/lib/mystic/record-referral-on-confirm';
import { resolveReferrerUserIdByCode, resolveReferrerUserIdByName } from '@/lib/mystic/referrals';

export async function createBookingCheckoutSession(input: {
  admin: SupabaseClient;
  stripe: Stripe | null;
  clientUserId: string;
  clientEmail: string | null;
  parsed: MysticCreateAppointmentInput;
  appUrl: string;
  useMobileCancelDeepLink?: boolean;
  skipPolicies?: boolean;
}): Promise<
  | { ok: false; status: number; error: string }
  | { ok: true; url: string; appointmentId: string; mock?: boolean }
> {
  const prep = await prepareBookingCheckout(input.admin, input.clientUserId, input.parsed, {
    skipPolicies: input.skipPolicies,
  });
  if (!prep.ok) return prep;

  const appointment = await new MysticAppointmentService(input.admin).create({
    workspaceId: input.parsed.workspaceId,
    clientUserId: input.clientUserId,
    serviceId: input.parsed.serviceId,
    startsAt: input.parsed.scheduledAt,
    durationMinutes: prep.service.durationMinutes,
    address: input.parsed.address,
    distanceMiles: prep.distanceMiles,
    entitlement: input.parsed.entitlement,
    quoteCents: input.parsed.quoteCents,
    surchargeJson: input.parsed.surchargeJson,
    tipCents: input.parsed.tipCents,
    tags: input.parsed.tags,
    referredByName: input.parsed.referredByName,
    clientNotes: input.parsed.clientNotes,
    depositCents: prep.depositCents,
    promoCode: prep.promoCode,
    discountCents: prep.discountCents,
  });

  let referrerUserId: string | null = null;
  if (input.parsed.referralCode) {
    referrerUserId = await resolveReferrerUserIdByCode(
      input.admin,
      input.parsed.workspaceId,
      input.parsed.referralCode
    );
  } else if (input.parsed.referredByName) {
    referrerUserId = await resolveReferrerUserIdByName(
      input.admin,
      input.parsed.referredByName,
      input.parsed.workspaceId
    );
  }

  const { data: clientProfile } = await input.admin
    .from('profiles')
    .select('full_name')
    .eq('id', input.clientUserId)
    .maybeSingle();
  const referredName =
    clientProfile?.full_name?.trim() || input.clientEmail?.split('@')[0] || 'New client';

  const workspaceId = input.parsed.workspaceId;
  const totalCents = prep.totalCents;

  async function confirmWithoutStripe() {
    await input.admin
      .from('mystic_appointments')
      .update({ status: 'confirmed', payment_captured: totalCents === 0 })
      .eq('id', appointment.id);
    if (referrerUserId) {
      await recordReferralOnBookingConfirmed(input.admin, {
        workspaceId,
        appointmentId: appointment.id,
        clientUserId: input.clientUserId,
        referrerUserId,
        referredName,
      });
    }
    await onMysticAppointmentConfirmed(input.admin, appointment.id);
    return {
      ok: true as const,
      url: `${input.appUrl}/book/success?appointment_id=${appointment.id}`,
      appointmentId: appointment.id,
      mock: true,
    };
  }

  if (totalCents === 0) {
    return confirmWithoutStripe();
  }

  if (!input.stripe && process.env.NODE_ENV !== 'production') {
    return confirmWithoutStripe();
  }

  if (!input.stripe) {
    return { ok: false, status: 500, error: 'Stripe is not configured' };
  }

  const session = await input.stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: input.clientEmail ?? undefined,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: totalCents,
          product_data: {
            name: `${prep.service.name} — Mystic Hair house call`,
            description: new Date(input.parsed.scheduledAt).toLocaleString(),
          },
        },
        quantity: 1,
      },
    ],
    success_url: input.useMobileCancelDeepLink
      ? `mystichair://book/success?appointment_id=${appointment.id}`
      : `${input.appUrl}/book/success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointment.id}`,
    cancel_url: input.useMobileCancelDeepLink
      ? 'mystichair://book?canceled=1'
      : `${input.appUrl}/book?canceled=1`,
    payment_intent_data: {
      capture_method: 'manual',
      metadata: {
        mystic_kind: 'booking',
        appointment_id: appointment.id,
        deposit_cents: String(prep.depositCents),
      },
    },
    metadata: {
      mystic_kind: 'booking',
      appointment_id: appointment.id,
      workspace_id: workspaceId,
      deposit_cents: String(prep.depositCents),
      client_user_id: input.clientUserId,
      ...(referrerUserId
        ? {
            referrer_user_id: referrerUserId,
            referred_name: referredName.slice(0, 120),
          }
        : {}),
    },
  });

  return {
    ok: true,
    url: session.url ?? `${input.appUrl}/book/success?appointment_id=${appointment.id}`,
    appointmentId: appointment.id,
  };
}
