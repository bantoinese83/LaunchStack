import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { createBookingCheckoutSession } from '@/lib/mystic/create-booking-session';
import { firstZodIssueMessage, mysticStudioBookForClientSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';
import { getStripeClient } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticStudioBookForClientSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const { clientUserId, ...appointmentInput } = parsed.data;
    const appointmentBody = {
      ...appointmentInput,
      policiesAccepted: appointmentInput.policiesAccepted ?? true,
    };

    const { data: profile } = await createSupabaseAdminClient()
      .from('profiles')
      .select('email')
      .eq('id', clientUserId)
      .maybeSingle();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL not configured' }, { status: 500 });
    }

    const admin = createSupabaseAdminClient();
    const stripe = process.env.STRIPE_SECRET_KEY ? getStripeClient({ allowDevMock: true }) : null;

    const result = await createBookingCheckoutSession({
      admin,
      stripe,
      clientUserId,
      clientEmail: profile?.email ?? null,
      parsed: appointmentBody,
      appUrl,
      skipPolicies: true,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      checkoutUrl: result.url,
      appointmentId: result.appointmentId,
      mock: result.mock ?? false,
    });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.studio.book');
  }
}
