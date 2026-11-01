import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { firstZodIssueMessage, mysticBlockedIntervalSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';
import { z } from 'zod';

const deleteSchema = z.object({
  workspaceId: z.string().min(1),
  id: z.uuid(),
});

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
    const { data, error } = await admin
      .from('mystic_blocked_intervals')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('ends_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(100);
    if (error) throw error;

    return NextResponse.json({ intervals: data ?? [] });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.blockedIntervals.list');
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticBlockedIntervalSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from('mystic_blocked_intervals')
      .insert({
        workspace_id: parsed.data.workspaceId,
        starts_at: parsed.data.startsAt,
        ends_at: parsed.data.endsAt,
        reason: parsed.data.reason ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ interval: data });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.blockedIntervals.create');
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = deleteSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from('mystic_blocked_intervals')
      .delete()
      .eq('id', parsed.data.id)
      .eq('workspace_id', parsed.data.workspaceId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.blockedIntervals.delete');
  }
}
