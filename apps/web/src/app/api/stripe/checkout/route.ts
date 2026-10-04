import { NextResponse } from 'next/server';
import { createCheckoutSchema, firstZodIssueMessage } from '@template/validation';
import { createSupabaseAdminClient } from '@template/api';
import { canManageBilling } from '@template/auth';
import { getStripeClient } from '@/lib/stripe';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { withRouteSpan } from '@/lib/observability';

export async function POST(req: Request) {
  return withRouteSpan('stripe.checkout', async () => {
    try {
      const auth = await requireAuthenticatedUser(req);
      if (auth.response) return auth.response;
      const user = auth.user;

      const adminSupabase = createSupabaseAdminClient();

      const body = await req.json();
      const validation = createCheckoutSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: firstZodIssueMessage(validation.error) },
          { status: 400 }
        );
      }

      const { workspaceId, priceId } = validation.data;

      // ── 3. Authorize: caller must be workspace_owner (billing gated to owner) ─
      const { data: membership } = await adminSupabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      if (!canManageBilling(membership?.role ?? null)) {
        return NextResponse.json(
          { error: 'Forbidden: only the workspace owner can manage billing' },
          { status: 403 }
        );
      }

      // ── 4. Fetch workspace & create/reuse Stripe customer ──────────────────
      const stripe = getStripeClient({ allowDevMock: true });

      const { data: workspace, error: wsError } = await adminSupabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();

      if (wsError || !workspace) {
        return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
      }

      let stripeCustomerId = workspace.stripe_customer_id;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          name: workspace.name,
          metadata: { workspace_id: workspaceId },
        });
        stripeCustomerId = customer.id;
        await adminSupabase
          .from('workspaces')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', workspaceId);
      }

      // ── 5. Build redirect URLs from server-side env, not the Origin header ──
      // Using the client-controlled Origin header allows IDOR-style URL spoofing.
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!appUrl) {
        console.error('[Stripe Checkout] NEXT_PUBLIC_APP_URL is not configured');
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
      }

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/dashboard`,
        metadata: { workspace_id: workspaceId },
      });

      return NextResponse.json({ url: session.url });
    } catch (err) {
      return routeErrorResponse(err, '[Stripe Checkout Route Error]');
    }
  });
}
