import Stripe from 'stripe';

export const STRIPE_API_VERSION = '2024-04-10' as const;

type StripeClientOptions = {
  /** Local checkout can exercise the route without live keys; webhooks never allow this. */
  allowDevMock?: boolean;
};

/**
 * Shared Stripe client for API routes. Production always requires STRIPE_SECRET_KEY.
 * Checkout may use a mock key in non-production when allowDevMock is set.
 */
export function getStripeClient(options: StripeClientOptions = {}): Stripe {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    if (options.allowDevMock && process.env.NODE_ENV !== 'production') {
      return new Stripe('sk_test_mock', { apiVersion: STRIPE_API_VERSION });
    }
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secret, { apiVersion: STRIPE_API_VERSION });
}

/**
 * Production always verifies. Local/test may skip only when no real webhook secret is configured.
 */
export function mustVerifyStripeWebhookSignature(webhookSecret: string | undefined): boolean {
  if (process.env.NODE_ENV === 'production') return true;
  return Boolean(webhookSecret && webhookSecret !== 'whsec_mock');
}
