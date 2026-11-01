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

function csvEscape(value: string | number | null | undefined) {
  const s = value == null ? '' : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(headers: string[], rows: (string | number | null | undefined)[][]) {
  const lines = [headers.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(','));
  }
  return lines.join('\n');
}

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const url = new URL(req.url);
    const workspaceId = url.searchParams.get('workspaceId');
    const kind = url.searchParams.get('kind') ?? 'appointments';
    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, workspaceId);
    if (forbidden) return forbidden;

    const admin = createSupabaseAdminClient();
    const filenameBase = `mystic-${kind}-${new Date().toISOString().slice(0, 10)}`;

    if (kind === 'clients') {
      const { data: clients } = await admin
        .from('mystic_client_profiles')
        .select('user_id, phone, referral_code')
        .eq('workspace_id', workspaceId)
        .limit(2000);
      const ids = (clients ?? []).map((c) => c.user_id);
      const { data: profiles } = ids.length
        ? await admin.from('profiles').select('id, full_name, email').in('id', ids)
        : { data: [] };
      const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
      const csv = toCsv(
        ['name', 'email', 'phone', 'referral_code'],
        (clients ?? []).map((c) => {
          const p = byId.get(c.user_id);
          return [p?.full_name ?? '', p?.email ?? '', c.phone ?? '', c.referral_code ?? ''];
        })
      );
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filenameBase}.csv"`,
        },
      });
    }

    if (kind === 'analytics') {
      const periodParam = url.searchParams.get('period') ?? 'mtd';
      if (!isStudioAnalyticsPeriod(periodParam)) {
        return NextResponse.json({ error: 'period must be mtd, 7d, or 30d' }, { status: 400 });
      }
      const period: StudioAnalyticsPeriod = periodParam;
      const range = studioAnalyticsPeriodRange(period, new Date());
      const { data: appointments } = await admin
        .from('mystic_appointments')
        .select('service_id, quote_cents, tip_cents, status, starts_at')
        .eq('workspace_id', workspaceId)
        .gte('starts_at', range.start.toISOString())
        .lte('starts_at', range.end.toISOString());
      const summary = buildStudioAnalyticsSummary(appointments ?? [], period, new Date());
      const csv = toCsv(
        ['metric', 'value'],
        [
          ['period', summary.periodLabel],
          ['completed_revenue_cents', summary.revenueCents],
          ['bookings', summary.bookingCount],
          ['completed', summary.completedCount],
          ['canceled', summary.canceledCount],
          ['no_show', summary.noShowCount],
          ['tips_cents', summary.tipCents],
          ...summary.byService.map(
            (row) => [`service_${row.serviceId}_count`, row.count] as [string, number]
          ),
        ]
      );
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filenameBase}.csv"`,
        },
      });
    }

    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const rangeStart = from ?? new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
    const rangeEnd = to ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

    const { data: rows, error } = await admin
      .from('mystic_appointments')
      .select(
        'starts_at, service_id, status, quote_cents, tip_cents, discount_cents, promo_code, client_user_id'
      )
      .eq('workspace_id', workspaceId)
      .gte('starts_at', `${rangeStart}T00:00:00.000Z`)
      .lte('starts_at', `${rangeEnd}T23:59:59.999Z`)
      .order('starts_at', { ascending: true });
    if (error) throw error;

    const csv = toCsv(
      [
        'starts_at',
        'service_id',
        'status',
        'quote_cents',
        'tip_cents',
        'discount_cents',
        'promo_code',
        'client_user_id',
      ],
      (rows ?? []).map((r) => [
        r.starts_at,
        r.service_id,
        r.status,
        r.quote_cents,
        r.tip_cents,
        r.discount_cents ?? 0,
        r.promo_code ?? '',
        r.client_user_id,
      ])
    );

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filenameBase}.csv"`,
      },
    });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.studio.export');
  }
}
