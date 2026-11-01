import { NextResponse } from 'next/server';
import { MysticBlastService, createSupabaseAdminClient } from '@template/api';
import { normalizePromoCode } from '@template/mystic';
import { firstZodIssueMessage, mysticBlastSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';
import { sendMarketingBlast } from '@/lib/mystic/notifications';
import { resolveBlastRecipients } from '@/lib/mystic/recipients';

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
    const blasts = await new MysticBlastService(admin).list(workspaceId);
    return NextResponse.json({ blasts });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.blasts.list');
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticBlastSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const admin = createSupabaseAdminClient();
    const blastService = new MysticBlastService(admin);
    let body = parsed.data.body;
    if (parsed.data.promoCode?.trim()) {
      const code = normalizePromoCode(parsed.data.promoCode);
      body = `${body.trim()}\n\nUse promo code ${code} at checkout on your next house call.`;
    }

    const draft = await blastService.createDraft({
      workspaceId: parsed.data.workspaceId,
      createdBy: auth.user.id,
      channel: parsed.data.channel,
      segment: parsed.data.segment,
      subject: parsed.data.subject,
      body,
    });

    const recipients = await resolveBlastRecipients(
      admin,
      parsed.data.workspaceId,
      parsed.data.segment
    );
    const sent = await sendMarketingBlast({
      recipients,
      channel: parsed.data.channel,
      subject: parsed.data.subject,
      body,
    });

    const updated = await blastService.markSent(draft.id, sent);
    return NextResponse.json({ blast: updated, sent }, { status: 201 });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.blasts.send');
  }
}
