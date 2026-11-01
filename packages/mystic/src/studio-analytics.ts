/** Studio ops analytics — period windows and summary math (web + mobile). */

export const STUDIO_ANALYTICS_PERIODS = ['mtd', '7d', '30d'] as const;
export type StudioAnalyticsPeriod = (typeof STUDIO_ANALYTICS_PERIODS)[number];

export type StudioAnalyticsAppointment = {
  service_id: string;
  quote_cents: number | null;
  tip_cents: number | null;
  status: string;
  starts_at: string;
};

export type StudioServiceMixRow = {
  serviceId: string;
  count: number;
  revenueCents: number;
};

export type StudioAnalyticsSlice = {
  bookingCount: number;
  completedCount: number;
  canceledCount: number;
  noShowCount: number;
  upcomingCount: number;
  revenueCents: number;
  tipCents: number;
  avgTicketCents: number;
  /** Completed ÷ (completed + no-show). Null when neither exists. */
  completionRate: number | null;
  /** No-show ÷ (completed + no-show). Null when neither exists. */
  noShowRate: number | null;
  byService: StudioServiceMixRow[];
};

export type StudioAnalyticsSummary = StudioAnalyticsSlice & {
  period: StudioAnalyticsPeriod;
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  prior: Pick<StudioAnalyticsSlice, 'bookingCount' | 'completedCount' | 'revenueCents'>;
};

export type StudioAnalyticsRange = {
  start: Date;
  end: Date;
  priorStart: Date;
  priorEnd: Date;
};

const MS_DAY = 86_400_000;

export function isStudioAnalyticsPeriod(
  value: string | null | undefined
): value is StudioAnalyticsPeriod {
  return STUDIO_ANALYTICS_PERIODS.includes(value as StudioAnalyticsPeriod);
}

export function studioAnalyticsPeriodRange(
  period: StudioAnalyticsPeriod,
  now = new Date()
): StudioAnalyticsRange {
  const end = new Date(now);
  let start: Date;
  if (period === 'mtd') {
    start = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0, 0);
  } else if (period === '7d') {
    start = new Date(end.getTime() - 7 * MS_DAY);
  } else {
    start = new Date(end.getTime() - 30 * MS_DAY);
  }
  const duration = Math.max(end.getTime() - start.getTime(), MS_DAY);
  const priorEnd = new Date(start.getTime());
  const priorStart = new Date(start.getTime() - duration);
  return { start, end, priorStart, priorEnd };
}

export function studioAnalyticsPeriodLabel(
  period: StudioAnalyticsPeriod,
  range: StudioAnalyticsRange,
  now = new Date()
): string {
  if (period === 'mtd') {
    return now.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  }
  const from = range.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const to = range.end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${from} – ${to}`;
}

function inRange(iso: string, from: Date, to: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= from.getTime() && t <= to.getTime();
}

function summarizeSlice(rows: StudioAnalyticsAppointment[]): StudioAnalyticsSlice {
  let completedCount = 0;
  let canceledCount = 0;
  let noShowCount = 0;
  let upcomingCount = 0;
  let revenueCents = 0;
  let tipCents = 0;
  const mix = new Map<string, { count: number; revenueCents: number }>();

  for (const row of rows) {
    if (row.status === 'canceled') {
      canceledCount += 1;
      continue;
    }

    const entry = mix.get(row.service_id) ?? { count: 0, revenueCents: 0 };
    entry.count += 1;

    if (row.status === 'completed') {
      completedCount += 1;
      const quote = row.quote_cents ?? 0;
      const tip = row.tip_cents ?? 0;
      revenueCents += quote + tip;
      tipCents += tip;
      entry.revenueCents += quote + tip;
    } else if (row.status === 'no_show') {
      noShowCount += 1;
    } else {
      upcomingCount += 1;
    }

    mix.set(row.service_id, entry);
  }

  const bookingCount = rows.length - canceledCount;
  const settled = completedCount + noShowCount;
  const avgTicketCents = completedCount > 0 ? Math.round(revenueCents / completedCount) : 0;

  const byService = [...mix.entries()]
    .map(([serviceId, v]) => ({
      serviceId,
      count: v.count,
      revenueCents: v.revenueCents,
    }))
    .sort((a, b) => b.count - a.count || b.revenueCents - a.revenueCents);

  return {
    bookingCount,
    completedCount,
    canceledCount,
    noShowCount,
    upcomingCount,
    revenueCents,
    tipCents,
    avgTicketCents,
    completionRate: settled > 0 ? completedCount / settled : null,
    noShowRate: settled > 0 ? noShowCount / settled : null,
    byService,
  };
}

export function buildStudioAnalyticsSummary(
  appointments: StudioAnalyticsAppointment[],
  period: StudioAnalyticsPeriod,
  now = new Date()
): StudioAnalyticsSummary {
  const range = studioAnalyticsPeriodRange(period, now);
  const currentRows = appointments.filter((a) => inRange(a.starts_at, range.start, range.end));
  const priorRows = appointments.filter((a) =>
    inRange(a.starts_at, range.priorStart, range.priorEnd)
  );
  const current = summarizeSlice(currentRows);
  const prior = summarizeSlice(priorRows);

  return {
    ...current,
    period,
    periodStart: range.start.toISOString(),
    periodEnd: range.end.toISOString(),
    periodLabel: studioAnalyticsPeriodLabel(period, range, now),
    prior: {
      bookingCount: prior.bookingCount,
      completedCount: prior.completedCount,
      revenueCents: prior.revenueCents,
    },
  };
}

/** Relative change vs prior period. Null when prior is zero. */
export function studioAnalyticsDelta(
  current: number,
  prior: number
): { pct: number; direction: 'up' | 'down' | 'flat' } | null {
  if (prior === 0) {
    if (current === 0) return { pct: 0, direction: 'flat' };
    return null;
  }
  const pct = Math.round(((current - prior) / prior) * 100);
  if (pct === 0) return { pct: 0, direction: 'flat' };
  return { pct: Math.abs(pct), direction: pct > 0 ? 'up' : 'down' };
}

export function formatStudioAnalyticsRate(rate: number | null): string {
  if (rate == null) return '—';
  return `${Math.round(rate * 100)}%`;
}
