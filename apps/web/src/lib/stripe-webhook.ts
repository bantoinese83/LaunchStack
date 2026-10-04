import type Stripe from 'stripe';
import { getErrorMessage } from '@template/validation';
import { getStripeClient, mustVerifyStripeWebhookSignature } from '@/lib/stripe';

export type StripeWebhookParseResult =
  { event: Stripe.Event; errorResponse?: never } | { event?: never; errorResponse: Response };

/**
 * Verifies (when configured) and parses an incoming Stripe webhook payload.
 * Returns a ready-to-send Response on failure.
 */
export function parseStripeWebhookEvent(
  body: string,
  signature: string | null,
  webhookSecret: string | undefined,
  createErrorResponse: (message: string, status: number) => Response
): StripeWebhookParseResult {
  try {
    if (mustVerifyStripeWebhookSignature(webhookSecret)) {
      if (!webhookSecret || webhookSecret === 'whsec_mock') {
        console.error('[Webhook] STRIPE_WEBHOOK_SECRET is required in production');
        return { errorResponse: createErrorResponse('Webhook not configured', 500) };
      }
      if (!signature) {
        return { errorResponse: createErrorResponse('Missing stripe-signature header', 400) };
      }
      const event = getStripeClient().webhooks.constructEvent(body, signature, webhookSecret);
      return { event };
    }

    return { event: JSON.parse(body) as Stripe.Event };
  } catch (err) {
    const message = getErrorMessage(err, 'Unknown webhook error');
    console.error(`[Webhook Signature Verification Failed]: ${message}`);
    return { errorResponse: createErrorResponse(`Webhook Error: ${message}`, 400) };
  }
}
