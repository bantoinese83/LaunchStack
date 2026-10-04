import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { z } from 'zod';
import { firstZodIssueMessage } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';

const schema = z.object({
  title: z.string().min(1).max(80),
  body: z.string().min(1).max(200),
  userId: z.uuid().optional(),
});

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;
    const validation = schema.safeParse(await req.json());
    if (!validation.success) {
      return NextResponse.json({ error: firstZodIssueMessage(validation.error) }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const targetUser = validation.data.userId ?? auth.user.id;
    if (targetUser !== auth.user.id) {
      const { data: profile } = await admin
        .from('profiles')
        .select('system_role')
        .eq('id', auth.user.id)
        .single();
      if (profile?.system_role !== 'super_admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const { data: tokens } = await admin
      .from('push_tokens')
      .select('token')
      .eq('user_id', targetUser);
    if (!tokens?.length) {
      return NextResponse.json({ sent: 0 });
    }

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        tokens.map((row) => ({
          to: row.token,
          title: validation.data.title,
          body: validation.data.body,
        }))
      ),
    });
    if (!response.ok) {
      throw new Error('Expo push gateway rejected the request');
    }
    return NextResponse.json({ sent: tokens.length });
  } catch (err) {
    return routeErrorResponse(err, '[Push Send]');
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;
    const body = (await req.json()) as { token?: string; platform?: string };
    if (!body.token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from('push_tokens').upsert({
      user_id: auth.user.id,
      token: body.token,
      platform: body.platform ?? 'unknown',
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return routeErrorResponse(err, '[Push Register]');
  }
}
