import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { normalizePromoCode } from '@template/mystic';
import { firstZodIssueMessage, mysticPromotionSchema } from '@template/validation';
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
      .from('mystic_promotions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return NextResponse.json({ promotions: data ?? [] });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.studio.promotions.list');
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticPromotionSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const code = normalizePromoCode(parsed.data.code);
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from('mystic_promotions')
      .insert({
        workspace_id: parsed.data.workspaceId,
        code,
        label: parsed.data.label?.trim() || code,
        percent_off: parsed.data.percentOff ?? null,
        amount_off_cents: parsed.data.amountOffCents ?? null,
        active: parsed.data.active ?? true,
        expires_at: parsed.data.expiresAt ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ promotion: data }, { status: 201 });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.studio.promotions.create');
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
      .from('mystic_promotions')
      .delete()
      .eq('id', parsed.data.id)
      .eq('workspace_id', parsed.data.workspaceId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.studio.promotions.delete');
  }
}
