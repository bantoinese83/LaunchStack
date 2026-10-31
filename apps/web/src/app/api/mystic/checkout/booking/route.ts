import { NextResponse } from 'next/server';
import {
  MysticAppointmentService,
  MysticReferralService,
  createSupabaseAdminClient,
} from '@template/api';
import { computeBookingQuote, getServiceById } from '@template/mystic';
import { onMysticAppointmentConfirmed } from '@/lib/mystic/confirm-appointment';
import { assertEntitlementForBooking } from '@/lib/mystic/entitlement';
import { firstZodIssueMessage, mysticCreateAppointmentSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { getStripeClient } from '@/lib/stripe';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { resolveReferrerUserIdByCode, resolveReferrerUserIdByName } from '@/lib/mystic/referrals';

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const parsed = mysticCreateAppointmentSchema.safeParse({
      ...body,
      workspaceId: body.workspaceId ?? getMysticWorkspaceId(),
    });
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: studioSettings } = await admin
      .from('mystic_studio_settings')
      .select('deposit_cents')
      .eq('workspace_id', parsed.data.workspaceId)
      .maybeSingle();
    const depositCents = studioSettings?.deposit_cents ?? 2500;

    const entitlementCheck = await assertEntitlementForBooking(admin, {
      workspaceId: parsed.data.workspaceId,
      userId: auth.user.id,
      entitlement: parsed.data.entitlement,
      serviceId: parsed.data.serviceId,
    });
    if (!entitlementCheck.ok) {
      return NextResponse.json({ error: entitlementCheck.error }, { status: 400 });
    }

    const service = getServiceById(parsed.data.serviceId);
    const serverQuote = computeBookingQuote({
      serviceId: parsed.data.serviceId,
      scheduledAt: new Date(parsed.data.scheduledAt),
      distanceMiles: parsed.data.distanceMiles,
      entitlement: parsed.data.entitlement,
      tipCents: parsed.data.tipCents ?? 0,
    });
    const usesCredit = parsed.data.entitlement !== 'none' && parsed.data.serviceId === 'blowout';
    const expectedQuoteCents = usesCredit
      ? 0
      : serverQuote.totalCents - (parsed.data.tipCents ?? 0);
    if (Math.abs(parsed.data.quoteCents - expectedQuoteCents) > 1) {
      return NextResponse.json({ error: 'Quote expired — refresh and try again' }, { status: 400 });
    }
    const appointment = await new MysticAppointmentService(admin).create({
      workspaceId: parsed.data.workspaceId,
      clientUserId: auth.user.id,
      serviceId: parsed.data.serviceId,
      startsAt: parsed.data.scheduledAt,
      durationMinutes: service.durationMinutes,
      address: parsed.data.address,
      distanceMiles: parsed.data.distanceMiles,
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

    if (referrerUserId && referrerUserId !== auth.user.id) {
      const { data: clientProfile } = await admin
        .from('profiles')
        .select('full_name')
        .eq('id', auth.user.id)
        .maybeSingle();
      const referredName =
        clientProfile?.full_name?.trim() || auth.user.email?.split('@')[0] || 'New client';

      await new MysticReferralService(admin).recordReferral({
        workspaceId: parsed.data.workspaceId,
        referrerUserId,
        referredName,
        referredUserId: auth.user.id,
        appointmentId: appointment.id,
      });
    }

    const totalCents = expectedQuoteCents + (parsed.data.tipCents ?? 0);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL not configured' }, { status: 500 });
    }

    const stripe = getStripeClient({ allowDevMock: true });

    async function confirmWithoutStripe() {
      await admin
        .from('mystic_appointments')
        .update({ status: 'confirmed', payment_captured: totalCents === 0 })
        .eq('id', appointment.id);
      await onMysticAppointmentConfirmed(admin, appointment.id);
      return NextResponse.json({
        url: `${appUrl}/book/success?appointment_id=${appointment.id}`,
        mock: true,
      });
    }

    if (totalCents === 0) {
      return confirmWithoutStripe();
    }

    if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== 'production') {
      return confirmWithoutStripe();
    }

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
      success_url: `${appUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/book?canceled=1`,
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
      },
    });

    return NextResponse.json({ url: session.url, appointmentId: appointment.id });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.checkout.booking');
  }
}
