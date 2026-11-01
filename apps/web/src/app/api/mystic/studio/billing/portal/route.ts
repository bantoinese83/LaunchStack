import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { mysticUserIdSchema, mysticWorkspaceIdSchema } from '@template/validation';
import { firstZodIssueMessage } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';
import { getStripeClient } from '@/lib/stripe';
import { z } from 'zod';

const bodySchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
  clientUserId: mysticUserIdSchema,
});

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
    }

    const admin = createSupabaseAdminClient();
    const { data: clientProfile } = await admin
      .from('mystic_client_profiles')
      .select('stripe_customer_id')
      .eq('workspace_id', parsed.data.workspaceId)
      .eq('user_id', parsed.data.clientUserId)
      .maybeSingle();

    let customerId = clientProfile?.stripe_customer_id as string | null;
    const stripe = getStripeClient({ allowDevMock: false });

    if (!customerId) {
      const { data: profile } = await admin
        .from('profiles')
        .select('email, full_name')
        .eq('id', parsed.data.clientUserId)
        .maybeSingle();
      if (!profile?.email) {
        return NextResponse.json(
          { error: 'Client has no email for Stripe lookup' },
          { status: 400 }
        );
      }
      const existing = await stripe.customers.list({ email: profile.email, limit: 1 });
      customerId = existing.data[0]?.id ?? null;
      if (!customerId) {
        const created = await stripe.customers.create({
          email: profile.email,
          name: profile.full_name ?? undefined,
          metadata: {
            mystic_client_user_id: parsed.data.clientUserId,
            workspace_id: parsed.data.workspaceId,
          },
        });
        customerId = created.id;
      }
      await admin.from('mystic_client_profiles').upsert({
        user_id: parsed.data.clientUserId,
        workspace_id: parsed.data.workspaceId,
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/studio/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.studio.billing.portal');
  }
}
