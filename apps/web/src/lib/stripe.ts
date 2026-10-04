import Stripe from 'stripe';

export const STRIPE_API_VERSION = '2026-08-26.dahlia' as const;

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

/** Expandable Stripe fields are either an ID string or an expanded object with `id`. */
export function resolveStripeExpandableId(
  value: string | { id: string } | null | undefined
): string | null {
  if (value == null) return null;
  return typeof value === 'string' ? value : value.id;
}

/**
 * Period end for persistence. Prefer the first subscription item until stripe type
 * stubs expose top-level `current_period_end` for API version 2026-08-26.dahlia.
 */
export function subscriptionCurrentPeriodEndIso(subscription: Stripe.Subscription): string {
  const unix = subscription.items.data[0]?.current_period_end;
  if (unix == null) {
    throw new Error(
      `[Stripe] Subscription ${subscription.id} is missing current_period_end on its first item`
    );
  }
  return new Date(unix * 1000).toISOString();
}

/** Fields shared by checkout completion and subscription update webhooks. */
export function subscriptionSyncPayload(subscription: Stripe.Subscription) {
  return {
    status: subscription.status,
    current_period_end: subscriptionCurrentPeriodEndIso(subscription),
    cancel_at_period_end: subscription.cancel_at_period_end,
  };
}
