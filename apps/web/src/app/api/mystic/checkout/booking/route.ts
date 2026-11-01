import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import {
  claimCheckoutIdempotency,
  completeCheckoutIdempotency,
  readCheckoutIdempotencyKey,
  releaseCheckoutIdempotency,
} from '@/lib/mystic/checkout-idempotency';
import { createBookingCheckoutSession } from '@/lib/mystic/create-booking-session';
import { firstZodIssueMessage, mysticCreateAppointmentSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { getStripeClient } from '@/lib/stripe';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return abortCheckout(500, 'NEXT_PUBLIC_APP_URL not configured');
    }

    const stripe = process.env.STRIPE_SECRET_KEY ? getStripeClient({ allowDevMock: true }) : null;

    const result = await createBookingCheckoutSession({
      admin,
      stripe,
      clientUserId,
      clientEmail: auth.user.email ?? null,
      parsed: parsed.data,
      appUrl,
      useMobileCancelDeepLink,
    });

    if (!result.ok) {
      return abortCheckout(result.status, result.error);
    }

    const payload = {
      url: result.url,
      appointmentId: result.appointmentId,
      ...(result.mock ? { mock: true } : {}),
    };

    if (idempotencyKey) {
      await completeCheckoutIdempotency(
        admin,
        clientUserId,
        idempotencyKey,
        result.appointmentId,
        payload
      );
    }

    return NextResponse.json(payload);
  } catch (err) {
    if (idempotencyClaimed && idempotencyKey && admin) {
      await releaseCheckoutIdempotency(admin, clientUserId, idempotencyKey).catch(() => undefined);
    }
    return routeErrorResponse(err, 'mystic.checkout.booking');
  }
}
