'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import {
  formatStudioAnalyticsRate,
  formatUsd,
  getServiceById,
  studioAnalyticsDelta,
  type ServiceId,
  type StudioAnalyticsPeriod,
  type StudioAnalyticsSummary,
  type StudioServiceMixRow,
} from '@template/mystic';
import { StudioLoadingRows } from '@/components/mystic/studio/StudioLoadingRows';
import { StudioWorkspaceNotice } from '@/components/mystic/studio/StudioWorkspaceNotice';
import {
  mysticSegmentShell,
  mysticSegmentTab,
  mysticToolbarRow,
} from '@/components/mystic/mystic-styles';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';

type SummaryPayload = Omit<StudioAnalyticsSummary, 'byService'> & {
  byService: Record<string, number> | StudioServiceMixRow[];
};

const PERIODS: { id: StudioAnalyticsPeriod; label: string }[] = [
  { id: 'mtd', label: 'This month' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
];

function serviceLabel(id: string) {
  try {
    return getServiceById(id as ServiceId).name;
  } catch {
    return id.replace(/_/g, ' ');
  }
}

function normalizeMix(summary: SummaryPayload): StudioServiceMixRow[] {
  if (Array.isArray(summary.byService)) {
    return summary.byService;
  }
  return Object.entries(summary.byService)
    .map(([serviceId, count]) => ({ serviceId, count, revenueCents: 0 }))
    .sort((a, b) => b.count - a.count);
}

function DeltaBadge({
  current,
  prior,
  onDark = false,
}: {
  current: number;
  prior: number;
  onDark?: boolean;
}) {
  const delta = studioAnalyticsDelta(current, prior);
  if (!delta || delta.direction === 'flat') {
    return (
      <span className={`text-xs ${onDark ? 'text-paper/50' : 'text-muted'}`}>vs prior period</span>
    );
  }
  const good = delta.direction === 'up';
  const tone = onDark ? (good ? 'text-gold' : 'text-paper/70') : good ? 'text-accent' : 'text-plum';
  return (
    <span
      className={`text-xs tabular-nums ${tone}`}
      title="Compared to the previous window of the same length"
    >
      {delta.direction === 'up' ? '↑' : '↓'} {delta.pct}% vs prior
    </span>
  );
}

export function AnalyticsPanel() {
  const workspaceId = getMysticWorkspaceId();
  const [period, setPeriod] = useState<StudioAnalyticsPeriod>('mtd');
  const [summary, setSummary] = useState<SummaryPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    void fetch(
      `/api/mystic/analytics/summary?workspaceId=${encodeURIComponent(workspaceId)}&period=${period}`,
      { signal: controller.signal }
    )
      .then(async (r) => {
        const data = (await r.json()) as SummaryPayload & { error?: string };
        if (id !== requestId.current) return;
        if (!r.ok || data.error) {
          setError(data.error ?? `Could not load analytics (${r.status})`);
          return;
        }
        setSummary(data);
      })
      .catch((err: unknown) => {
        if (id !== requestId.current) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError('Failed to load analytics');
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [workspaceId, period]);

  useDeferredEffect(load, [load]);

  if (!workspaceId) {
    return <StudioWorkspaceNotice />;
  }

  const mix = summary ? normalizeMix(summary) : [];
  const mixTotal = mix.reduce((sum, row) => sum + row.count, 0);
  const empty =
    summary &&
    summary.bookingCount === 0 &&
    summary.canceledCount === 0 &&
    summary.completedCount === 0;

  return (
    <div className="space-y-8">
      <div className={mysticToolbarRow}>
        <div
          className={`${mysticSegmentShell} w-full max-w-md`}
          role="tablist"
          aria-label="Analytics period"
        >
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={period === p.id}
              onClick={() => setPeriod(p.id)}
              className={mysticSegmentTab(period === p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <a
            href={`/api/mystic/studio/export?workspaceId=${workspaceId}&kind=analytics&period=${period}`}
            className="text-sm text-accent underline"
          >
            Export summary CSV
          </a>
          <a
            href={`/api/mystic/studio/export?workspaceId=${workspaceId}&kind=appointments`}
            className="text-sm text-accent underline"
          >
            Export visits CSV
          </a>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="text-sm text-accent underline disabled:opacity-50"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="space-y-2" role="alert">
          <p className="text-sm text-danger">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="text-sm text-accent underline"
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading && !summary ? (
        <div className="space-y-6">
          <div className="h-36 animate-pulse rounded-lg bg-line/40" />
          <StudioLoadingRows count={2} />
        </div>
      ) : null}

      {summary && !error ? (
        <>
          <p className="type-eyebrow text-plum">{summary.periodLabel}</p>

          {empty ? (
            <div className="border-b border-line/80 py-10">
              <p className="font-display text-2xl font-medium text-ink">No visits in this window</p>
              <p className="mt-2 max-w-md text-sm text-muted">
                Numbers appear after house calls are booked for these dates. Switch period or pull
                to refresh after the board updates.
              </p>
            </div>
          ) : (
            <>
              <div className="mystic-lift overflow-hidden rounded-xl border-line/50">
                <div className="bg-shell px-6 py-8 text-paper md:px-8 md:py-10">
                  <p className="type-eyebrow text-gold">Completed revenue</p>
                  <p className="font-display mt-3 text-5xl font-medium tracking-tight text-paper tabular-nums md:text-6xl lg:text-7xl">
                    {formatUsd(summary.revenueCents)}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <DeltaBadge
                      current={summary.revenueCents}
                      prior={summary.prior.revenueCents}
                      onDark
                    />
                    {summary.tipCents > 0 ? (
                      <span className="text-xs text-paper/55">
                        incl. {formatUsd(summary.tipCents)} tips
                      </span>
                    ) : null}
                    {summary.avgTicketCents > 0 ? (
                      <span className="text-xs text-paper/55">
                        avg ticket {formatUsd(summary.avgTicketCents)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <Metric
                  label="Bookings"
                  value={String(summary.bookingCount)}
                  hint={
                    summary.upcomingCount > 0
                      ? `${summary.upcomingCount} still upcoming`
                      : undefined
                  }
                  delta={
                    <DeltaBadge current={summary.bookingCount} prior={summary.prior.bookingCount} />
                  }
                />
                <Metric
                  label="Completed"
                  value={String(summary.completedCount)}
                  hint={formatStudioAnalyticsRate(summary.completionRate) + ' settle rate'}
                  delta={
                    <DeltaBadge
                      current={summary.completedCount}
                      prior={summary.prior.completedCount}
                    />
                  }
                />
                <Metric
                  label="No-shows"
                  value={String(summary.noShowCount)}
                  hint={
                    summary.noShowRate != null
                      ? formatStudioAnalyticsRate(summary.noShowRate) + ' of settled'
                      : undefined
                  }
                />
                <Metric
                  label="Canceled"
                  value={String(summary.canceledCount)}
                  hint="Excluded from booking count"
                />
              </dl>

              <section className="mystic-lift rounded-xl border-line/70 bg-surface/90 p-6 md:p-8">
                <div className="flex items-baseline justify-between gap-3 border-b border-line/80 pb-3">
                  <h2 className="font-display mystic-gradient-ink text-xl font-medium">
                    Service mix
                  </h2>
                  <span className="text-xs text-muted tabular-nums">
                    {mixTotal} visit{mixTotal === 1 ? '' : 's'}
                  </span>
                </div>
                {mix.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">No active bookings in this window.</p>
                ) : (
                  <ul className="mt-5 space-y-5">
                    {mix.map((row) => {
                      const pct = mixTotal > 0 ? Math.round((row.count / mixTotal) * 100) : 0;
                      return (
                        <li key={row.serviceId}>
                          <div className="flex items-baseline justify-between gap-3 text-sm">
                            <span className="font-medium text-ink">
                              {serviceLabel(row.serviceId)}
                            </span>
                            <span className="shrink-0 tabular-nums text-muted">
                              {row.count}
                              {row.revenueCents > 0 ? ` · ${formatUsd(row.revenueCents)}` : ''}
                            </span>
                          </div>
                          <div
                            className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line/50"
                            role="presentation"
                          >
                            <div
                              className="h-full rounded-full bg-gold transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                              style={{ width: `${Math.max(pct, row.count > 0 ? 4 : 0)}%` }}
                            />
                          </div>
                          <p className="mt-1.5 text-[11px] tabular-nums text-muted">
                            {pct}% of mix
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </>
          )}
        </>
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  delta,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: ReactNode;
}) {
  return (
    <div className="border-b border-line/50 pb-5 sm:border-0 sm:pb-0">
      <dt className="type-eyebrow text-plum">{label}</dt>
      <dd className="font-display mt-2 text-3xl font-medium tabular-nums tracking-tight text-ink">
        {value}
      </dd>
      {hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
      {delta ? <div className="mt-1.5">{delta}</div> : null}
    </div>
  );
}
