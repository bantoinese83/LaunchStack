import type Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { MysticCreditsService } from '@template/api';
import type { MembershipId, PackageId } from '@template/mystic';
import { onMysticAppointmentConfirmed } from '@/lib/mystic/confirm-appointment';
import { creditGrantForMembership, creditGrantForPackage } from '@/lib/mystic/credits';
import { resolveStripeExpandableId, subscriptionSyncPayload } from '@/lib/stripe';

export type WebhookHandler = (
  event: Stripe.Event,
  stripe: Stripe,
  supabaseAdmin: SupabaseClient
) => Promise<void>;

export const checkoutSessionCompleted: WebhookHandler = async (event, stripe, supabaseAdmin) => {
  const session = event.data.object as Stripe.Checkout.Session;
  const mysticKind = session.metadata?.mystic_kind;

  if (mysticKind === 'booking' && session.metadata?.appointment_id) {
    await supabaseAdmin
      .from('mystic_appointments')
      .update({
        status: 'confirmed',
        stripe_payment_intent_id:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : (session.payment_intent?.id ?? null),
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.metadata.appointment_id);
    await onMysticAppointmentConfirmed(supabaseAdmin, session.metadata.appointment_id);
    return;
  }

  if (mysticKind === 'membership' && session.metadata?.client_user_id) {
    const workspaceId = session.metadata.workspace_id;
    const userId = session.metadata.client_user_id;
    const membershipId = session.metadata.membership_id as MembershipId | undefined;
    await supabaseAdmin.from('mystic_client_profiles').upsert({
      user_id: userId,
      workspace_id: workspaceId,
      updated_at: new Date().toISOString(),
    });
    if (workspaceId && membershipId) {
      const grant = creditGrantForMembership(membershipId);
      const subId = resolveStripeExpandableId(session.subscription);
      if (grant) {
        await new MysticCreditsService(supabaseAdmin).grantCredit({
          workspaceId,
          userId,
          ...grant,
          stripeSubscriptionId: subId,
        });
      }
    }
  }

  if (mysticKind === 'package' && session.metadata?.client_user_id) {
    const workspaceId = session.metadata.workspace_id;
    const userId = session.metadata.client_user_id;
    const packageId = session.metadata.package_id as PackageId | undefined;
    if (workspaceId && packageId) {
      const grant = creditGrantForPackage(packageId);
      if (grant) {
        await new MysticCreditsService(supabaseAdmin).grantCredit({
          workspaceId,
          userId,
          ...grant,
        });
      }
    }
  }

  if (mysticKind === 'preorder' && session.metadata?.preorder_id) {
    await supabaseAdmin
      .from('mystic_preorders')
      .update({ status: 'paid', stripe_checkout_session_id: session.id })
      .eq('id', session.metadata.preorder_id);
  }

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

export const invoicePaymentSucceeded: WebhookHandler = async (event, stripe, supabaseAdmin) => {
  const invoice = event.data.object as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  };
  const subscriptionId = resolveStripeExpandableId(invoice.subscription);
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const workspaceId = subscription.metadata?.workspace_id;
  const userId = subscription.metadata?.client_user_id;
  const membershipId = subscription.metadata?.membership_id as MembershipId | undefined;
  if (!workspaceId || !userId || !membershipId) return;
  if (invoice.billing_reason === 'subscription_create') return;

  const grant = creditGrantForMembership(membershipId);
  if (grant) {
    await new MysticCreditsService(supabaseAdmin).grantCredit({
      workspaceId,
      userId,
      ...grant,
      stripeSubscriptionId: subscriptionId,
    });
  }
};

export const webhookHandlers: Record<string, WebhookHandler> = {
  'checkout.session.completed': checkoutSessionCompleted,
  'customer.subscription.updated': customerSubscriptionUpdated,
  'customer.subscription.deleted': customerSubscriptionUpdated,
  'invoice.payment_failed': invoicePaymentFailed,
  'invoice.payment_succeeded': invoicePaymentSucceeded,
};
