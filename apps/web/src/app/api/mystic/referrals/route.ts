import { NextResponse } from 'next/server';
import { MysticReferralService, createSupabaseAdminClient } from '@template/api';
import { referralsUntilReward } from '@template/mystic';
import { z } from 'zod';
import { firstZodIssueMessage } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';

const createSchema = z.object({
  workspaceId: z.uuid(),
  referrerUserId: z.uuid().optional(),
  referredName: z.string().min(2).max(120),
  appointmentId: z.uuid().optional(),
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
    const referrals = await new MysticReferralService(admin).listForStudio(workspaceId);
    return NextResponse.json({ referrals });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.referrals.list');
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const referrerUserId = parsed.data.referrerUserId ?? auth.user.id;

    const referral = await new MysticReferralService(admin).recordReferral({
      workspaceId: parsed.data.workspaceId,
      referrerUserId,
      referredName: parsed.data.referredName,
      referredUserId: auth.user.id,
      appointmentId: parsed.data.appointmentId,
    });

    const count = await new MysticReferralService(admin).countForReferrer(
      parsed.data.workspaceId,
      referrerUserId
    );

    return NextResponse.json({
      referral,
      referrerTotal: count,
      untilReward: referralsUntilReward(count),
    });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.referrals.create');
  }
}
