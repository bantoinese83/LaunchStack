'use client';

import { useEffect, useState } from 'react';
import { formatUsd } from '@template/mystic';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

type Summary = {
  bookingCount: number;
  revenueCents: number;
  byService: Record<string, number>;
  completedCount: number;
  noShowCount: number;
};

export function AnalyticsPanel() {
  const workspaceId = getMysticWorkspaceId();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) return;
    void fetch(`/api/mystic/analytics/summary?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setSummary(data);
      })
      .catch(() => setError('Failed to load analytics'));
  }, [workspaceId]);

  if (!workspaceId) {
    return <p className="text-sm text-muted">Set NEXT_PUBLIC_MYSTIC_WORKSPACE_ID</p>;
  }
  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!summary) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-sm text-muted">Bookings (MTD)</p>
        <p className="font-display text-3xl">{summary.bookingCount}</p>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-sm text-muted">Revenue (MTD)</p>
        <p className="font-display text-3xl">{formatUsd(summary.revenueCents)}</p>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-sm text-muted">No-shows</p>
        <p className="font-display text-3xl">{summary.noShowCount}</p>
      </div>
      <div className="md:col-span-3 rounded-2xl border border-line bg-surface p-5">
        <p className="text-sm font-medium">By service</p>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {Object.entries(summary.byService).map(([service, count]) => (
            <li key={service}>
              {service}: {count}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
