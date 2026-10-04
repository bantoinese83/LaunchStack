import { NextResponse } from 'next/server';
import { AuditService, WorkspaceService, createSupabaseAdminClient } from '@template/api';
import { canManageMembers } from '@template/auth';
import { WORKSPACE_ROLES } from '@template/types';
import { firstZodIssueMessage } from '@template/validation';
import { z } from 'zod';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { withRouteSpan } from '@/lib/observability';

const updateMemberSchema = z.object({
  memberId: z.uuid(),
  workspaceId: z.uuid(),
  role: z.enum(WORKSPACE_ROLES),
});

export async function PATCH(req: Request) {
  return withRouteSpan('members.update', async () => {
    try {
      const auth = await requireAuthenticatedUser(req);
      if (auth.response) return auth.response;
      const validation = updateMemberSchema.safeParse(await req.json());
      if (!validation.success) {
        return NextResponse.json(
          { error: firstZodIssueMessage(validation.error) },
          { status: 400 }
        );
      }
      const admin = createSupabaseAdminClient();
      const { data: membership } = await admin
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', validation.data.workspaceId)
        .eq('user_id', auth.user.id)
        .single();
      if (!canManageMembers(membership?.role ?? null)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (validation.data.role === 'workspace_owner') {
        return NextResponse.json(
          { error: 'Cannot assign workspace owner via this API' },
          { status: 400 }
        );
      }
      const member = await new WorkspaceService(admin).updateMemberRole(
        validation.data.memberId,
        validation.data.role
      );
      await new AuditService(admin).logAuditEvent(
        validation.data.workspaceId,
        auth.user.id,
        'member.role_updated',
        'workspace_members',
        validation.data.memberId,
        { role: validation.data.role }
      );
      return NextResponse.json({ member });
    } catch (err) {
      return routeErrorResponse(err, '[Members PATCH]');
    }
  });
}

export async function DELETE(req: Request) {
  return withRouteSpan('members.remove', async () => {
    try {
      const auth = await requireAuthenticatedUser(req);
      if (auth.response) return auth.response;
      const { searchParams } = new URL(req.url);
      const memberId = searchParams.get('memberId');
      const workspaceId = searchParams.get('workspaceId');
      if (!memberId || !workspaceId) {
        return NextResponse.json(
          { error: 'memberId and workspaceId are required' },
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
      const { data: target } = await admin
        .from('workspace_members')
        .select('role')
        .eq('id', memberId)
        .single();
      if (target?.role === 'workspace_owner') {
        return NextResponse.json({ error: 'Cannot remove the workspace owner' }, { status: 400 });
      }
      await new WorkspaceService(admin).removeMember(memberId);
      await new AuditService(admin).logAuditEvent(
        workspaceId,
        auth.user.id,
        'member.removed',
        'workspace_members',
        memberId,
        {}
      );
      return NextResponse.json({ ok: true });
    } catch (err) {
      return routeErrorResponse(err, '[Members DELETE]');
    }
  });
}
