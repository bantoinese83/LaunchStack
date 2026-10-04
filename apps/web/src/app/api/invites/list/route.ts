import { NextResponse } from 'next/server';
import { InviteService, createSupabaseAdminClient } from '@template/api';
import { canManageMembers } from '@template/auth';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { withRouteSpan } from '@/lib/observability';

export async function GET(req: Request) {
  return withRouteSpan('invites.list', async () => {
    try {
      const auth = await requireAuthenticatedUser(req);
      if (auth.response) return auth.response;
      const workspaceId = new URL(req.url).searchParams.get('workspaceId');
      if (!workspaceId) {
        return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
      }
      const admin = createSupabaseAdminClient();
      const { data: membership } = await admin
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', auth.user.id)
        .single();
      if (!canManageMembers(membership?.role ?? null)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const invites = await new InviteService(admin).listPending(workspaceId);
      return NextResponse.json({ invites });
    } catch (err) {
      return routeErrorResponse(err, '[Invites List]');
    }
  });
}

export async function DELETE(req: Request) {
  return withRouteSpan('invites.revoke', async () => {
    try {
      const auth = await requireAuthenticatedUser(req);
      if (auth.response) return auth.response;
      const inviteId = new URL(req.url).searchParams.get('inviteId');
      const workspaceId = new URL(req.url).searchParams.get('workspaceId');
      if (!inviteId || !workspaceId) {
        return NextResponse.json(
          { error: 'inviteId and workspaceId are required' },
          { status: 400 }
        );
      }
      const admin = createSupabaseAdminClient();
      const { data: membership } = await admin
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', auth.user.id)
        .single();
      if (!canManageMembers(membership?.role ?? null)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      await new InviteService(admin).revokeInvite(inviteId);
      return NextResponse.json({ ok: true });
    } catch (err) {
      return routeErrorResponse(err, '[Invites Revoke]');
    }
  });
}
