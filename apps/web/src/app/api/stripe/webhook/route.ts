import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createSupabaseAdminClient } from '@template/api';
import { getStripeClient, mustVerifyStripeWebhookSignature } from '@/lib/stripe';
import { webhookHandlers } from './handlers';

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

  const handler = webhookHandlers[event.type];

  if (handler) {
    await handler(event, stripe, supabaseAdmin);
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
