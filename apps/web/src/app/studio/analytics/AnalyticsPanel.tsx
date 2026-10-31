'use client';

import { useCallback, useState } from 'react';
import { formatUsd, getServiceById, type ServiceId } from '@template/mystic';
import { StudioLoadingRows } from '@/components/mystic/studio/StudioLoadingRows';
import { StudioWorkspaceNotice } from '@/components/mystic/studio/StudioWorkspaceNotice';
import { mysticCard } from '@/components/mystic/mystic-styles';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';

type Summary = {
  bookingCount: number;
  revenueCents: number;
  byService: Record<string, number>;
  completedCount: number;
  noShowCount: number;
};

function serviceLabel(id: string) {
  try {
    return getServiceById(id as ServiceId).name;
  } catch {
    return id.replace(/_/g, ' ');
  }
}

export function AnalyticsPanel() {
  const workspaceId = getMysticWorkspaceId();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    void fetch(`/api/mystic/analytics/summary?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setSummary(data);
      })
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useDeferredEffect(load, [load]);

  if (!workspaceId) {
    return <StudioWorkspaceNotice />;
  }

  if (loading && !summary) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${mysticCard} h-24 animate-pulse`} />
          ))}
        </div>
        <StudioLoadingRows count={1} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-danger">{error}</p>
        <button type="button" onClick={load} className="text-sm text-accent underline">
          Retry
        </button>
      </div>
    );
  }

  if (!summary) {
    return <p className="text-sm text-muted">No analytics data yet.</p>;
  }

  const serviceEntries = Object.entries(summary.byService).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="text-sm text-accent underline disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Bookings (MTD)', value: String(summary.bookingCount) },
          { label: 'Completed (MTD)', value: String(summary.completedCount) },
          { label: 'Revenue (MTD)', value: formatUsd(summary.revenueCents) },
          { label: 'No-shows (MTD)', value: String(summary.noShowCount) },
        ].map((stat) => (
          <div key={stat.label} className={`${mysticCard} p-5`}>
            <p className="text-xs text-muted">{stat.label}</p>
            <p className="font-display mt-1 text-3xl font-medium tabular-nums text-ink">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
      <div className={`${mysticCard} p-5`}>
        <p className="text-sm font-medium text-ink">By service (MTD)</p>
        {serviceEntries.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No completed bookings this month yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {serviceEntries.map(([service, count]) => (
              <li
                key={service}
                className="flex items-center justify-between gap-4 text-sm border-b border-line/60 pb-2 last:border-0"
              >
                <span className="text-ink">{serviceLabel(service)}</span>
                <span className="tabular-nums text-muted">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
