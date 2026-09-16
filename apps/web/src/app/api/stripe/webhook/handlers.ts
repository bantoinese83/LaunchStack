import type Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';

export type WebhookHandler = (
  event: Stripe.Event,
  stripe: Stripe,
  supabaseAdmin: SupabaseClient
) => Promise<void>;

export const checkoutSessionCompleted: WebhookHandler = async (event, stripe, supabaseAdmin) => {
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
      current_period_end: new Date(
        subscription.items.data[0].current_period_end * 1000
      ).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
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
      .update({
        status: subscription.status,
        current_period_end: new Date(
          subscription.items.data[0].current_period_end * 1000
        ).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('stripe_subscription_id', subscription.id);
  }
};

export const invoicePaymentFailed: WebhookHandler = async (event) => {
  const invoice = event.data.object as Stripe.Invoice;
  console.warn(`[Stripe Payment Failed] Invoice ID: ${invoice.id}, Customer: ${invoice.customer}`);
};

export const webhookHandlers: Record<string, WebhookHandler> = {
  'checkout.session.completed': checkoutSessionCompleted,
  'customer.subscription.updated': customerSubscriptionUpdated,
  'customer.subscription.deleted': customerSubscriptionUpdated,
  'invoice.payment_failed': invoicePaymentFailed,
};
