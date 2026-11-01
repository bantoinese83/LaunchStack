import { NextResponse } from 'next/server';
import { MysticReferralService, createSupabaseAdminClient } from '@template/api';
import { DEFAULT_REFERRAL_REWARD_AFTER, referralsUntilReward } from '@template/mystic';
import { z } from 'zod';
import {
  firstZodIssueMessage,
  mysticUserIdSchema,
  mysticWorkspaceIdSchema,
} from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { resolveReferrerUserIdByCode } from '@/lib/mystic/referrals';
import { requireStudioManager } from '@/lib/mystic/studio-auth';

const createSchema = z
  .object({
    workspaceId: mysticWorkspaceIdSchema,
    referrerUserId: mysticUserIdSchema.optional(),
    referrerCode: z.string().min(4).max(16).optional(),
    referredName: z.string().min(2).max(120),
    referredUserId: mysticUserIdSchema.optional(),
    appointmentId: z.guid().optional(),
  })
  .refine((value) => Boolean(value.referrerUserId || value.referrerCode), {
    message: 'referrerUserId or referrerCode is required',
  });

const monthSchema = z.string().regex(/^\d{4}-\d{2}$/);

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const url = new URL(req.url);
    const workspaceParsed = mysticWorkspaceIdSchema.safeParse(url.searchParams.get('workspaceId'));
    if (!workspaceParsed.success) {
      return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
    }
    const workspaceId = workspaceParsed.data;

    const forbidden = await requireStudioManager(auth.user, workspaceId);
    if (forbidden) return forbidden;

    const admin = createSupabaseAdminClient();
    const service = new MysticReferralService(admin);

    const view = url.searchParams.get('view');
    const monthParam = url.searchParams.get('month');
    if (view === 'dashboard') {
      const month =
        monthParam && monthSchema.safeParse(monthParam).success
          ? monthParam
          : new Date().toISOString().slice(0, 7);
      const dashboard = await service.dashboardForMonth(workspaceId, month);
      return NextResponse.json({ dashboard });
    }

    const referrals = await service.listForStudio(workspaceId);
    return NextResponse.json({ referrals });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.referrals.list');
  }
}

/** Studio-only manual referral entry (booking confirm path records automatically). */
export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const admin = createSupabaseAdminClient();
    const referrerUserId =
      parsed.data.referrerUserId ??
      (parsed.data.referrerCode
        ? await resolveReferrerUserIdByCode(
            admin,
            parsed.data.workspaceId,
            parsed.data.referrerCode
          )
        : null);

    if (!referrerUserId) {
      return NextResponse.json({ error: 'Referrer code not found' }, { status: 404 });
    }

    if (referrerUserId === parsed.data.referredUserId) {
      return NextResponse.json(
        { error: 'Referrer and referred client must be different people' },
        { status: 400 }
      );
    }

    const service = new MysticReferralService(admin);

    const referral = await service.recordReferral({
      workspaceId: parsed.data.workspaceId,
      referrerUserId,
      referredName: parsed.data.referredName,
      referredUserId: parsed.data.referredUserId,
      appointmentId: parsed.data.appointmentId,
    });

    const [{ data: settings }, pending, total] = await Promise.all([
      admin
        .from('mystic_studio_settings')
        .select('referral_reward_after')
        .eq('workspace_id', parsed.data.workspaceId)
        .maybeSingle(),
      service.countPendingForReferrer(parsed.data.workspaceId, referrerUserId),
      service.countForReferrer(parsed.data.workspaceId, referrerUserId),
    ]);

    const threshold = settings?.referral_reward_after ?? DEFAULT_REFERRAL_REWARD_AFTER;

    return NextResponse.json({
      referral,
      referrerTotal: total,
      pendingTowardReward: pending,
      untilReward: referralsUntilReward(pending, threshold),
      threshold,
    });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.referrals.create');
  }
}
