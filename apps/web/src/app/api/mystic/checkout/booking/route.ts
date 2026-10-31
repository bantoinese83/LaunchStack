import { NextResponse } from 'next/server';
import { MysticAppointmentService, createSupabaseAdminClient } from '@template/api';
import { computeBookingQuote, getServiceById } from '@template/mystic';
import { onMysticAppointmentConfirmed } from '@/lib/mystic/confirm-appointment';
import { assertEntitlementForBooking } from '@/lib/mystic/entitlement';
import {
  claimCheckoutIdempotency,
  completeCheckoutIdempotency,
  readCheckoutIdempotencyKey,
  releaseCheckoutIdempotency,
} from '@/lib/mystic/checkout-idempotency';
import { firstZodIssueMessage, mysticCreateAppointmentSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { getStripeClient } from '@/lib/stripe';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { recordReferralOnBookingConfirmed } from '@/lib/mystic/record-referral-on-confirm';
import { resolveReferrerUserIdByCode, resolveReferrerUserIdByName } from '@/lib/mystic/referrals';
import { loadStudioSurchargeRules } from '@/lib/mystic/studio-surcharge-rules';
import { geocodeHouseCallAddress } from '@/lib/mystic/geocode';

export async function POST(req: Request) {
  const auth = await requireAuthenticatedUser(req);
  if (auth.response) return auth.response;

  let idempotencyKey: string | undefined;
  let admin: ReturnType<typeof createSupabaseAdminClient> | undefined;
  let idempotencyClaimed = false;
  const clientUserId = auth.user.id;

  async function abortCheckout(status: number, error: string) {
    if (idempotencyClaimed && idempotencyKey && admin) {
      await releaseCheckoutIdempotency(admin, clientUserId, idempotencyKey).catch(() => undefined);
    }
    return NextResponse.json({ error }, { status });
  }

  try {
    const rawBody = (await req.json()) as Record<string, unknown>;
    idempotencyKey = readCheckoutIdempotencyKey(req, rawBody);
    const useMobileCancelDeepLink = rawBody.useMobileCancelDeepLink === true;
    const { idempotencyKey: _drop, useMobileCancelDeepLink: _mobile, ...bodyWithoutKey } = rawBody;

    const parsed = mysticCreateAppointmentSchema.safeParse({
      ...bodyWithoutKey,
      workspaceId: bodyWithoutKey.workspaceId ?? getMysticWorkspaceId(),
    });
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    admin = createSupabaseAdminClient();

    if (idempotencyKey) {
      const claim = await claimCheckoutIdempotency(admin, clientUserId, idempotencyKey);
      if (claim.action === 'replay') {
        return NextResponse.json(claim.body);
      }
      if (claim.action === 'conflict') {
        return NextResponse.json(
          { error: 'Checkout already in progress — wait a moment and refresh if needed' },
          { status: 409 }
        );
      }
      idempotencyClaimed = true;
    }

    await new MysticAppointmentService(admin).cancelStalePending(parsed.data.workspaceId, 90);

    const { data: studioSettings } = await admin
      .from('mystic_studio_settings')
      .select('deposit_cents')
      .eq('workspace_id', parsed.data.workspaceId)
      .maybeSingle();
    const depositCents = studioSettings?.deposit_cents ?? 2500;

    const entitlementCheck = await assertEntitlementForBooking(admin, {
      workspaceId: parsed.data.workspaceId,
      userId: clientUserId,
      entitlement: parsed.data.entitlement,
      serviceId: parsed.data.serviceId,
    });
    if (!entitlementCheck.ok) {
      return abortCheckout(400, entitlementCheck.error);
    }

    const service = getServiceById(parsed.data.serviceId);
    let distanceMiles = parsed.data.distanceMiles;
    try {
      const geo = await geocodeHouseCallAddress(parsed.data.address);
      distanceMiles = geo.distanceMiles;
    } catch {
      /* keep client-supplied miles if geocoder unavailable */
    }

    const surchargeRules = await loadStudioSurchargeRules(admin, parsed.data.workspaceId);
    const serverQuote = computeBookingQuote({
      serviceId: parsed.data.serviceId,
      scheduledAt: new Date(parsed.data.scheduledAt),
      distanceMiles,
      entitlement: parsed.data.entitlement,
      tipCents: parsed.data.tipCents ?? 0,
      rules: surchargeRules,
    });
    const usesCredit = parsed.data.entitlement !== 'none' && parsed.data.serviceId === 'blowout';
    const expectedQuoteCents = usesCredit
      ? 0
      : serverQuote.totalCents - (parsed.data.tipCents ?? 0);
    if (Math.abs(parsed.data.quoteCents - expectedQuoteCents) > 1) {
      return abortCheckout(400, 'Quote expired — refresh and try again');
    }
    const appointment = await new MysticAppointmentService(admin).create({
      workspaceId: parsed.data.workspaceId,
      clientUserId,
      serviceId: parsed.data.serviceId,
      startsAt: parsed.data.scheduledAt,
      durationMinutes: service.durationMinutes,
      address: parsed.data.address,
      distanceMiles,
      entitlement: parsed.data.entitlement,
      quoteCents: parsed.data.quoteCents,
      surchargeJson: parsed.data.surchargeJson,
      tipCents: parsed.data.tipCents,
      tags: parsed.data.tags,
      referredByName: parsed.data.referredByName,
      clientNotes: parsed.data.clientNotes,
      depositCents,
    });

    let referrerUserId: string | null = null;
    if (parsed.data.referralCode) {
      referrerUserId = await resolveReferrerUserIdByCode(
        admin,
        parsed.data.workspaceId,
        parsed.data.referralCode
      );
    } else if (parsed.data.referredByName) {
      referrerUserId = await resolveReferrerUserIdByName(admin, parsed.data.referredByName);
    }

    const { data: clientProfile } = await admin
      .from('profiles')
      .select('full_name')
      .eq('id', clientUserId)
      .maybeSingle();
    const referredName =
      clientProfile?.full_name?.trim() || auth.user.email?.split('@')[0] || 'New client';

    const totalCents = expectedQuoteCents + (parsed.data.tipCents ?? 0);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return abortCheckout(500, 'NEXT_PUBLIC_APP_URL not configured');
    }

    const workspaceId = parsed.data.workspaceId;

    async function respond(payload: Record<string, unknown>) {
      if (idempotencyKey) {
        await completeCheckoutIdempotency(
          admin!,
          clientUserId,
          idempotencyKey,
          appointment.id,
          payload
        );
      }
      return NextResponse.json(payload);
    }

    async function confirmWithoutStripe() {
      await admin!
        .from('mystic_appointments')
        .update({ status: 'confirmed', payment_captured: totalCents === 0 })
        .eq('id', appointment.id);
      if (referrerUserId) {
        await recordReferralOnBookingConfirmed(admin!, {
          workspaceId,
          appointmentId: appointment.id,
          clientUserId,
          referrerUserId,
          referredName,
        });
      }
      await onMysticAppointmentConfirmed(admin!, appointment.id);
      return respond({
        url: `${appUrl}/book/success?appointment_id=${appointment.id}`,
        appointmentId: appointment.id,
        mock: true,
      });
    }

    if (totalCents === 0) {
      return confirmWithoutStripe();
    }

    if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== 'production') {
      return confirmWithoutStripe();
    }

    const stripe = getStripeClient({ allowDevMock: true });
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: auth.user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: totalCents,
            product_data: {
              name: `${service.name} — Mystic Hair house call`,
              description: new Date(parsed.data.scheduledAt).toLocaleString(),
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/book/success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointment.id}`,
      cancel_url: useMobileCancelDeepLink
        ? 'mystichair://book?canceled=1'
        : `${appUrl}/book?canceled=1`,
      payment_intent_data: {
        capture_method: 'manual',
        metadata: {
          mystic_kind: 'booking',
          appointment_id: appointment.id,
          deposit_cents: String(depositCents),
        },
      },
      metadata: {
        mystic_kind: 'booking',
        appointment_id: appointment.id,
        workspace_id: parsed.data.workspaceId,
        deposit_cents: String(depositCents),
        client_user_id: clientUserId,
        ...(referrerUserId
          ? {
              referrer_user_id: referrerUserId,
              referred_name: referredName.slice(0, 120),
            }
          : {}),
      },
    });

    return respond({ url: session.url, appointmentId: appointment.id });
  } catch (err) {
    if (idempotencyClaimed && idempotencyKey && admin) {
      await releaseCheckoutIdempotency(admin, clientUserId, idempotencyKey).catch(() => undefined);
    }
    return routeErrorResponse(err, 'mystic.checkout.booking');
  }
}
