import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { MYSTIC_MEMBERSHIPS } from '@template/mystic';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';
import { getStripeClient } from '@/lib/stripe';

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const workspaceId = new URL(req.url).searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, workspaceId);
    if (forbidden) return forbidden;

    const admin = createSupabaseAdminClient();
    const { data: credits, error } = await admin
      .from('mystic_client_credits')
      .select('user_id, source_id, blowouts_remaining, expires_at, stripe_subscription_id')
      .eq('workspace_id', workspaceId)
      .eq('source_kind', 'membership')
      .not('stripe_subscription_id', 'is', null);
    if (error) throw error;

    const userIds = [...new Set((credits ?? []).map((c) => c.user_id as string))];
    const { data: profiles } = userIds.length
      ? await admin.from('profiles').select('id, full_name, email').in('id', userIds)
      : { data: [] };
    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

    const { data: clientProfiles } = userIds.length
      ? await admin
          .from('mystic_client_profiles')
          .select('user_id, stripe_customer_id')
          .eq('workspace_id', workspaceId)
          .in('user_id', userIds)
      : { data: [] };
    const stripeCustomerByUser = new Map(
      (clientProfiles ?? []).map((p) => [p.user_id, p.stripe_customer_id as string | null])
    );

    const stripe = process.env.STRIPE_SECRET_KEY ? getStripeClient({ allowDevMock: false }) : null;

    const memberships = await Promise.all(
      (credits ?? []).map(async (row) => {
        const plan = MYSTIC_MEMBERSHIPS.find((m) => m.id === row.source_id);
        let status: string | null = null;
        let currentPeriodEnd: string | null = null;
        let cancelAtPeriodEnd = false;
        const subId = row.stripe_subscription_id as string;
        if (stripe && subId && !subId.startsWith('sub_demo')) {
          try {
            const sub = await stripe.subscriptions.retrieve(subId);
            status = sub.status;
            const periodEnd = (sub as { current_period_end?: number }).current_period_end;
            currentPeriodEnd = periodEnd != null ? new Date(periodEnd * 1000).toISOString() : null;
            cancelAtPeriodEnd = sub.cancel_at_period_end;
          } catch {
            status = 'unknown';
          }
        } else if (subId?.startsWith('sub_demo')) {
          status = 'active';
        }

        const profile = profileById.get(row.user_id as string);
        return {
          userId: row.user_id,
          clientName: profile?.full_name ?? profile?.email ?? row.user_id,
          email: profile?.email ?? null,
          membershipId: row.source_id,
          membershipName: plan?.name ?? row.source_id,
          blowoutsRemaining: row.blowouts_remaining,
          expiresAt: row.expires_at,
          stripeSubscriptionId: subId,
          stripeCustomerId: stripeCustomerByUser.get(row.user_id as string) ?? null,
          status,
          currentPeriodEnd,
          cancelAtPeriodEnd,
        };
      })
    );

    return NextResponse.json({ memberships });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.studio.billing');
  }
}
