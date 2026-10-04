import { NextResponse } from 'next/server';
import { createPortalSchema, firstZodIssueMessage } from '@template/validation';
import { createSupabaseAdminClient } from '@template/api';
import { canManageBilling } from '@template/auth';
import { getStripeClient } from '@/lib/stripe';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { withRouteSpan } from '@/lib/observability';

export async function POST(req: Request) {
  return withRouteSpan('stripe.portal', async () => {
    try {
      const auth = await requireAuthenticatedUser(req);
      if (auth.response) return auth.response;

      const adminSupabase = createSupabaseAdminClient();
      const body = await req.json();
      const validation = createPortalSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: firstZodIssueMessage(validation.error) },
          { status: 400 }
        );
      }

      const { workspaceId } = validation.data;
      const { data: membership } = await adminSupabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', auth.user.id)
        .single();

      if (!canManageBilling(membership?.role ?? null)) {
        return NextResponse.json(
          { error: 'Forbidden: only the workspace owner can manage billing' },
          { status: 403 }
        );
      }

      const { data: workspace } = await adminSupabase
        .from('workspaces')
        .select('stripe_customer_id')
        .eq('id', workspaceId)
        .single();

      if (!workspace?.stripe_customer_id) {
        return NextResponse.json(
          { error: 'No Stripe customer for this workspace' },
          { status: 400 }
        );
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!appUrl) {
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
      }

      const stripe = getStripeClient({ allowDevMock: true });
      const session = await stripe.billingPortal.sessions.create({
        customer: workspace.stripe_customer_id,
        return_url: `${appUrl}/dashboard`,
      });

      return NextResponse.json({ url: session.url });
    } catch (err) {
      return routeErrorResponse(err, '[Stripe Portal Route Error]');
    }
  });
}
