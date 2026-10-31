import { NextResponse } from 'next/server';
import { MysticMessageService, createSupabaseAdminClient } from '@template/api';
import { canManageMembers } from '@template/auth';
import {
  firstZodIssueMessage,
  mysticSendMessageSchema,
  mysticWorkspaceIdSchema,
} from '@template/validation';
import { z } from 'zod';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';

const listSchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
  clientUserId: z.uuid(),
});

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const params = Object.fromEntries(new URL(req.url).searchParams);
    const parsed = listSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    if (parsed.data.clientUserId !== auth.user.id) {
      const admin = createSupabaseAdminClient();
      const { data: membership } = await admin
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', parsed.data.workspaceId)
        .eq('user_id', auth.user.id)
        .maybeSingle();
      if (!canManageMembers(membership?.role ?? null)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const admin = createSupabaseAdminClient();
    const messages = await new MysticMessageService(admin).listThread(
      parsed.data.workspaceId,
      parsed.data.clientUserId
    );
    return NextResponse.json({ messages });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.messages.list');
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticSendMessageSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: membership } = await admin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', parsed.data.workspaceId)
      .eq('user_id', auth.user.id)
      .maybeSingle();

    const clientUserId = parsed.data.clientUserId ?? auth.user.id;
    const isStylist = canManageMembers(membership?.role ?? null);
    const isClient = clientUserId === auth.user.id;
    if (!isStylist && !isClient) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const message = await new MysticMessageService(admin).send({
      workspaceId: parsed.data.workspaceId,
      clientUserId,
      senderId: auth.user.id,
      senderRole: isStylist ? 'stylist' : 'client',
      body: parsed.data.body,
      appointmentId: parsed.data.appointmentId,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.messages.send');
  }
}
