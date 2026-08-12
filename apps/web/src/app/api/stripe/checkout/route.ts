import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createCheckoutSchema } from '@template/validation';
import { createSupabaseAdminClient, DomainAPI } from '@template/api';

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';
const stripe = new Stripe(stripeSecret, { apiVersion: '2024-04-10' });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = createCheckoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { workspaceId, priceId } = validation.data;
    const adminSupabase = createSupabaseAdminClient();
    const api = new DomainAPI(adminSupabase);

    // Retrieve workspace
    const { data: workspace, error: wsError } = await adminSupabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single();

    if (wsError || !workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 44 });
    }

    // Create or retrieve Stripe Customer
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

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/dashboard`,
      metadata: { workspace_id: workspaceId },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[Stripe Checkout Route Error]', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
