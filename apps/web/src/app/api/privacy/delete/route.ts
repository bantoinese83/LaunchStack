import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { getStripeClient } from '@/lib/stripe';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { withRouteSpan } from '@/lib/observability';

export async function POST(req: Request) {
  return withRouteSpan('privacy.delete', async () => {
    try {
      const auth = await requireAuthenticatedUser(req);
      if (auth.response) return auth.response;

      const admin = createSupabaseAdminClient();
      const userId = auth.user.id;

      const { data: owned } = await admin
        .from('workspace_members')
        .select('workspace_id, workspaces(stripe_customer_id)')
        .eq('user_id', userId)
        .eq('role', 'workspace_owner');

      if (process.env.STRIPE_SECRET_KEY) {
        const stripe = getStripeClient();
        for (const row of owned ?? []) {
          const workspace = row.workspaces as { stripe_customer_id?: string | null } | null;
          if (workspace?.stripe_customer_id) {
            const subs = await stripe.subscriptions.list({
              customer: workspace.stripe_customer_id,
              status: 'all',
              limit: 20,
            });
            await Promise.all(
              subs.data
                .filter((sub) => sub.status !== 'canceled')
                .map((sub) => stripe.subscriptions.cancel(sub.id).catch(() => undefined))
            );
          }
        }
      }

      await admin.from('feedback_votes').delete().eq('user_id', userId);
      await admin.from('feedback_posts').delete().eq('author_id', userId);
      await admin.from('workspace_invites').delete().eq('invited_by', userId);
      await admin.from('workspace_invites').delete().eq('email', auth.user.email);
      await admin.from('consent_records').delete().eq('user_id', userId);
      await admin.from('data_export_requests').delete().eq('user_id', userId);
      await admin.from('push_tokens').delete().eq('user_id', userId);
      await admin.from('mfa_recovery_codes').delete().eq('user_id', userId);

      for (const row of owned ?? []) {
        await admin.from('workspaces').delete().eq('id', row.workspace_id);
      }
      await admin.from('workspace_members').delete().eq('user_id', userId);

      await admin
        .from('profiles')
        .update({
          full_name: 'Deleted user',
          avatar_url: null,
          email: `deleted+${userId}@invalid.local`,
        })
        .eq('id', userId);
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json({ ok: true });
    } catch (err) {
      return routeErrorResponse(err, '[Privacy Delete Route Error]');
    }
  });
}
