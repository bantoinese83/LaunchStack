import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BrevoEmailService } from '@template/email';

const inviteEmailSchema = z.object({
  to: z.string().email(),
  inviterName: z.string().min(1).max(120),
  workspaceName: z.string().min(1).max(120),
  inviteUrl: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = inviteEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { to, inviterName, workspaceName, inviteUrl } = parsed.data;
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
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[Invite Email Route Error]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
