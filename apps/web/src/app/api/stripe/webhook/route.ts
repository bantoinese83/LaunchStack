import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { getStripeClient } from '@/lib/stripe';
import { parseStripeWebhookEvent } from '@/lib/stripe-webhook';
import { routeErrorResponse } from '@/lib/api/route-auth';
import { webhookHandlers } from './handlers';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const parsed = parseStripeWebhookEvent(body, signature, webhookSecret, (message, status) =>
    NextResponse.json({ error: message }, { status })
  );
  if (parsed.errorResponse) {
    return parsed.errorResponse;
  }
  const event = parsed.event;

  const supabaseAdmin = createSupabaseAdminClient();
  const stripe = getStripeClient();

  const handler = webhookHandlers[event.type];

  if (handler) {
    try {
      await handler(event, stripe, supabaseAdmin);
    } catch (err) {
      return routeErrorResponse(err, `[Webhook Handler ${event.type}]`);
    }
  } else {
    console.warn(`[Webhook] Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
