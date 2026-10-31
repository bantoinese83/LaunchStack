import { NextResponse } from 'next/server';
import { MysticStudioService, createSupabaseAdminClient } from '@template/api';
import { firstZodIssueMessage, mysticStudioSettingsSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';

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
    const settings = await new MysticStudioService(admin).getSettings(workspaceId);
    return NextResponse.json({ settings });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.studio.settings.get');
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticStudioSettingsSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const { workspaceId, ...patch } = parsed.data;
    const admin = createSupabaseAdminClient();
    const settings = await new MysticStudioService(admin).upsertSettings(workspaceId, {
      winter_buffer_enabled: patch.winterBufferEnabled,
      evening_surcharge_cents: patch.eveningSurchargeCents,
      included_miles: patch.includedMiles,
      per_mile_surcharge_cents: patch.perMileSurchargeCents,
      deposit_cents: patch.depositCents,
      door_timer_minutes: patch.doorTimerMinutes,
      referral_reward_after: patch.referralRewardAfter,
    });

    return NextResponse.json({ settings });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.studio.settings.patch');
  }
}
