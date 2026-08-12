import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createCheckoutSchema } from '@template/validation';
import { createSupabaseAdminClient } from '@template/api';

const STRIPE_API_VERSION = '2024-04-10' as const;

function getStripeClient(): Stripe {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    // Local/dev fallback so the route can still be exercised without live Stripe keys
    return new Stripe('sk_test_mock', { apiVersion: STRIPE_API_VERSION });
  }
  return new Stripe(secret, { apiVersion: STRIPE_API_VERSION });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = createCheckoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { workspaceId, priceId } = validation.data;
    const adminSupabase = createSupabaseAdminClient();
    const stripe = getStripeClient();

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

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard`,
      metadata: { workspace_id: workspaceId },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[Stripe Checkout Route Error]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
