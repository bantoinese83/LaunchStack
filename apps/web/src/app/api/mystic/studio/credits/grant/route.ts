import { NextResponse } from 'next/server';
import { MysticCreditsService, createSupabaseAdminClient } from '@template/api';
import { firstZodIssueMessage, mysticGrantCreditSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';

function defaultExpiryIso() {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toISOString();
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticGrantCreditSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const admin = createSupabaseAdminClient();
    const sourceId = crypto.randomUUID();
    const credit = await new MysticCreditsService(admin).grantCredit({
      workspaceId: parsed.data.workspaceId,
      userId: parsed.data.userId,
      sourceKind: 'manual',
      sourceId,
      blowoutsRemaining: parsed.data.blowoutsRemaining,
      expiresAt: parsed.data.expiresAt ?? defaultExpiryIso(),
    });

    return NextResponse.json({ credit });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.studio.credits.grant');
  }
}
