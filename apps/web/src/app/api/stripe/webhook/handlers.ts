import type Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { resolveStripeExpandableId, subscriptionSyncPayload } from '@/lib/stripe';

export type WebhookHandler = (
  event: Stripe.Event,
  stripe: Stripe,
  supabaseAdmin: SupabaseClient
) => Promise<void>;

export const checkoutSessionCompleted: WebhookHandler = async (event, stripe, supabaseAdmin) => {
  const session = event.data.object as Stripe.Checkout.Session;
  const workspaceId = session.metadata?.workspace_id;

  // Fix: session.subscription may be an expanded Subscription object, not a string ID.
  // Guard with typeof to avoid passing an object to stripe.subscriptions.retrieve().
  const subscriptionId = resolveStripeExpandableId(session.subscription);

  if (workspaceId && subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await supabaseAdmin.from('subscriptions').upsert({
      workspace_id: workspaceId,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: subscription.items.data[0].price.id,
      ...subscriptionSyncPayload(subscription),
    });
  }
};

export const customerSubscriptionUpdated: WebhookHandler = async (
  event,
  _stripe,
  supabaseAdmin
) => {
  const subscription = event.data.object as Stripe.Subscription;
  const { data: subRecord } = await supabaseAdmin
    .from('subscriptions')
    .select('workspace_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (subRecord) {
    await supabaseAdmin
      .from('subscriptions')
      .update(subscriptionSyncPayload(subscription))
      .eq('stripe_subscription_id', subscription.id);
  }
};

export const invoicePaymentFailed: WebhookHandler = async (event, _stripe, supabaseAdmin) => {
  // Cast through `unknown` to access the subscription field, whose presence
  // depends on the Stripe API version. The field is present in
  // 2026-08-26.dahlia but older type stubs may not include it.
  const invoice = event.data.object as unknown as {
    id: string;
    customer: string;
    subscription?: string | Stripe.Subscription | null;
  };

  const stripeSubscriptionId = resolveStripeExpandableId(invoice.subscription);

  if (stripeSubscriptionId) {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (error) {
      console.error(
        `[Stripe Payment Failed] Failed to update subscription status for ${stripeSubscriptionId}:`,
        error.message
      );
    }
  }
};

export const webhookHandlers: Record<string, WebhookHandler> = {
  'checkout.session.completed': checkoutSessionCompleted,
  'customer.subscription.updated': customerSubscriptionUpdated,
  'customer.subscription.deleted': customerSubscriptionUpdated,
  'invoice.payment_failed': invoicePaymentFailed,
};
