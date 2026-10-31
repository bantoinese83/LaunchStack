import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import {
  firstZodIssueMessage,
  mysticBlockedDateSchema,
  mysticWorkspaceIdSchema,
} from '@template/validation';
import { z } from 'zod';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

const listQuerySchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
});

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const params = Object.fromEntries(new URL(req.url).searchParams);
    const parsed = listQuerySchema.safeParse({
      workspaceId: params.workspaceId ?? getMysticWorkspaceId(),
    });
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const workspaceId = parsed.data.workspaceId;
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from('mystic_blocked_dates')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('block_date', new Date().toISOString().slice(0, 10))
      .order('block_date', { ascending: true })
      .limit(120);
    if (error) throw error;
    return NextResponse.json({ blockedDates: data ?? [] });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.blockedDates.list');
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticBlockedDateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from('mystic_blocked_dates')
      .upsert(
        {
          workspace_id: parsed.data.workspaceId,
          block_date: parsed.data.blockDate,
          reason: parsed.data.reason ?? null,
        },
        { onConflict: 'workspace_id,block_date' }
      )
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ blockedDate: data });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.blockedDates.create');
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = z.object({ id: z.uuid(), workspaceId: z.uuid() }).safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from('mystic_blocked_dates')
      .delete()
      .eq('id', parsed.data.id)
      .eq('workspace_id', parsed.data.workspaceId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.blockedDates.delete');
  }
}
