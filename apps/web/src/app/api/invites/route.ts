import { NextResponse } from 'next/server';
import { AuditService, InviteService, createSupabaseAdminClient } from '@template/api';
import { BrevoEmailService } from '@template/email';
import { createWorkspaceInviteSchema, firstZodIssueMessage } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const validation = createWorkspaceInviteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: firstZodIssueMessage(validation.error) }, { status: 400 });
    }

    const { workspaceId, email, role } = validation.data;
    const adminSupabase = createSupabaseAdminClient();
    const { data: membership } = await adminSupabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', auth.user.id)
      .single();

    if (!membership || !['workspace_owner', 'workspace_admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [{ data: workspace }, { data: profile }] = await Promise.all([
      adminSupabase.from('workspaces').select('name').eq('id', workspaceId).single(),
      adminSupabase.from('profiles').select('full_name, email').eq('id', auth.user.id).single(),
    ]);

    const invite = await new InviteService(adminSupabase).createInvite(
      workspaceId,
      email,
      role,
      auth.user.id
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const inviteUrl = `${appUrl}/invite/${invite.token}`;
    const result = await new BrevoEmailService().sendWorkspaceInvite(
      email,
      profile?.full_name || profile?.email || 'A teammate',
      workspace?.name || 'LaunchStack',
      inviteUrl
    );
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send invite' }, { status: 502 });
    }

    await new AuditService(adminSupabase).logAuditEvent(
      workspaceId,
      auth.user.id,
      'member.invited',
      'workspace_invites',
      invite.id,
      { email, role }
    );

    return NextResponse.json({ ok: true, inviteId: invite.id, inviteUrl });
  } catch (err) {
    return routeErrorResponse(err, '[Invite Route Error]');
  }
}
