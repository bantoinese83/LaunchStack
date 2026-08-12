import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createSupabaseAdminClient } from '@template/api';
import { getStripeClient, mustVerifyStripeWebhookSignature } from '@/lib/stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    if (mustVerifyStripeWebhookSignature(webhookSecret)) {
      if (!webhookSecret || webhookSecret === 'whsec_mock') {
        console.error('[Webhook] STRIPE_WEBHOOK_SECRET is required in production');
        return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
      }
      if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
      }
      event = getStripeClient().webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown webhook error';
    console.error(`[Webhook Signature Verification Failed]: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const stripe = getStripeClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspace_id;
      const subscriptionId = session.subscription as string;

      if (workspaceId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await supabaseAdmin.from('subscriptions').upsert({
          workspace_id: workspaceId,
          stripe_subscription_id: subscriptionId,
          stripe_price_id: subscription.items.data[0].price.id,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        });
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const { data: subRecord } = await supabaseAdmin
        .from('subscriptions')
        .select('workspace_id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (subRecord) {
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', subscription.id);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      console.warn(
        `[Stripe Payment Failed] Invoice ID: ${invoice.id}, Customer: ${invoice.customer}`
      );
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
