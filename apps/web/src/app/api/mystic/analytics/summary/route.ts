import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
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
    const from = new Date();
    from.setDate(1);
    from.setHours(0, 0, 0, 0);

    const { data: appointments, error } = await admin
      .from('mystic_appointments')
      .select('service_id, quote_cents, tip_cents, status, created_at')
      .eq('workspace_id', workspaceId)
      .gte('created_at', from.toISOString());

    if (error) throw error;

    const rows = appointments ?? [];
    const revenueCents = rows.reduce(
      (sum, row) => sum + (row.quote_cents ?? 0) + (row.tip_cents ?? 0),
      0
    );
    const byService: Record<string, number> = {};
    for (const row of rows) {
      byService[row.service_id] = (byService[row.service_id] ?? 0) + 1;
    }

    return NextResponse.json({
      periodStart: from.toISOString(),
      bookingCount: rows.length,
      revenueCents,
      byService,
      completedCount: rows.filter((r) => r.status === 'completed').length,
      noShowCount: rows.filter((r) => r.status === 'no_show').length,
    });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.analytics.summary');
  }
}
