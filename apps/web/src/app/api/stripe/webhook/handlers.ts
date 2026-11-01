import type Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { MysticCreditsService } from '@template/api';
import type { MembershipId, PackageId } from '@template/mystic';
import { onMysticAppointmentConfirmed } from '@/lib/mystic/confirm-appointment';
import { recordReferralOnBookingConfirmed } from '@/lib/mystic/record-referral-on-confirm';
import { creditGrantForMembership, creditGrantForPackage } from '@/lib/mystic/credits';
import { resolveStripeExpandableId } from '@/lib/stripe';

export type WebhookHandler = (
  event: Stripe.Event,
  stripe: Stripe,
  supabaseAdmin: SupabaseClient
) => Promise<void>;

export const checkoutSessionCompleted: WebhookHandler = async (event, _stripe, supabaseAdmin) => {
  const session = event.data.object as Stripe.Checkout.Session;
  const mysticKind = session.metadata?.mystic_kind;

  if (mysticKind === 'booking' && session.metadata?.appointment_id) {
    const appointmentId = session.metadata.appointment_id;

    // Only confirm a booking that is still awaiting payment.
    //
    // Stripe delivers (and retries) webhooks for days, so an unconditional update
    // could resurrect a visit the 90-minute stale-hold sweep had already canceled —
    // re-selling a slot the studio had given away — or drag an in-progress visit
    // back to 'confirmed'. The update is also checked now: it used to fail silently
    // and still email the client and consume their credit.
    const { data: confirmed, error } = await supabaseAdmin
      .from('mystic_appointments')
      .update({
        status: 'confirmed',
        stripe_payment_intent_id:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : (session.payment_intent?.id ?? null),
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .in('status', ['pending', 'confirmed'])
      .select('id');

    if (error) throw error;

    if (!confirmed?.length) {
      console.warn(
        `[Webhook] checkout.session.completed for appointment ${appointmentId} in a non-confirmable state — skipped`
      );
      return;
    }

    const referrerUserId = session.metadata.referrer_user_id?.trim();
    const clientUserId = session.metadata.client_user_id?.trim();
    if (referrerUserId && clientUserId && session.metadata.workspace_id) {
      await recordReferralOnBookingConfirmed(supabaseAdmin, {
        workspaceId: session.metadata.workspace_id,
        appointmentId,
        clientUserId,
        referrerUserId,
        referredName: session.metadata.referred_name?.trim() || 'New client',
      });
    }
    await onMysticAppointmentConfirmed(supabaseAdmin, appointmentId);
    return;
  }

  const stripeCustomerId =
    typeof session.customer === 'string' ? session.customer : (session.customer?.id ?? null);

  if (mysticKind === 'membership' && session.metadata?.client_user_id) {
    const workspaceId = session.metadata.workspace_id;
    const userId = session.metadata.client_user_id;
    const membershipId = session.metadata.membership_id as MembershipId | undefined;
    await supabaseAdmin.from('mystic_client_profiles').upsert({
      user_id: userId,
      workspace_id: workspaceId,
      ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {}),
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
      // Key the grant on the checkout session so a redelivered webhook updates the
      // same credit row instead of granting a second pack.
      const grant = creditGrantForPackage(packageId, session.id);
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
    // Same rule as bookings: never resurrect a canceled preorder, and surface a
    // failed write so Stripe retries instead of losing the payment.
    const { error } = await supabaseAdmin
      .from('mystic_preorders')
      .update({ status: 'paid', stripe_checkout_session_id: session.id })
      .eq('id', session.metadata.preorder_id)
      .in('status', ['pending', 'paid']);
    if (error) throw error;
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
  'invoice.payment_succeeded': invoicePaymentSucceeded,
};
