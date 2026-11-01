import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import {
  buildStudioAnalyticsSummary,
  isStudioAnalyticsPeriod,
  studioAnalyticsPeriodRange,
  type StudioAnalyticsPeriod,
} from '@template/mystic';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const url = new URL(req.url);
    const workspaceId = url.searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
    }

    const periodParam = url.searchParams.get('period') ?? 'mtd';
    if (!isStudioAnalyticsPeriod(periodParam)) {
      return NextResponse.json({ error: 'period must be mtd, 7d, or 30d' }, { status: 400 });
    }
    const period: StudioAnalyticsPeriod = periodParam;

    const forbidden = await requireStudioManager(auth.user, workspaceId);
    if (forbidden) return forbidden;

    const now = new Date();
    const range = studioAnalyticsPeriodRange(period, now);
    const admin = createSupabaseAdminClient();

    const { data: appointments, error } = await admin
      .from('mystic_appointments')
      .select('service_id, quote_cents, tip_cents, status, starts_at')
      .eq('workspace_id', workspaceId)
      .gte('starts_at', range.priorStart.toISOString())
      .lte('starts_at', range.end.toISOString());

    if (error) throw error;

    const summary = buildStudioAnalyticsSummary(appointments ?? [], period, now);

    /** Keep legacy `byService` map for older mobile clients. */
    const byService: Record<string, number> = {};
    for (const row of summary.byService) {
      byService[row.serviceId] = row.count;
    }

    return NextResponse.json({
      ...summary,
      byService,
    });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.analytics.summary');
  }
}
