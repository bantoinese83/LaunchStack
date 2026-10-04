import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BrevoEmailService } from '@template/email';
import { createSupabaseAdminClient } from '@template/api';
import { firstZodIssueMessage } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';

const inviteEmailSchema = z.object({
  to: z.string().email(),
  workspaceId: z.string().uuid(),
  inviterName: z.string().min(1).max(120),
  workspaceName: z.string().min(1).max(120),
  // Only allow https: links — blocks javascript: and data: URIs
  inviteUrl: z
    .string()
    .url()
    .refine(
      (u) =>
        u.startsWith('https://') ||
        u.startsWith('http://localhost') ||
        u.startsWith('http://127.0.0.1'),
      { message: 'inviteUrl must use https (or http://localhost for development)' }
    ),
});

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;
    const user = auth.user;

    const adminSupabase = createSupabaseAdminClient();

    // ── 2. Validate payload ─────────────────────────────────────────────────
    const body = await req.json();
    const parsed = inviteEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const { to, workspaceId, inviterName, workspaceName, inviteUrl } = parsed.data;

    // ── 3. Authorize: caller must be workspace_owner or workspace_admin ──────
    const { data: membership } = await adminSupabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !['workspace_owner', 'workspace_admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ── 4. Send email ───────────────────────────────────────────────────────
    const emailService = new BrevoEmailService();
    const result = await emailService.sendWorkspaceInvite(
      to,
      inviterName,
      workspaceName,
      inviteUrl
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send invite' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (err) {
    return routeErrorResponse(err, '[Invite Email Route Error]');
  }
}
