'use client';

import { useEffect, useMemo, useState } from 'react';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

type ReferrerRow = {
  referrerUserId: string;
  name: string;
  total: number;
  pending: number;
  credited: number;
};

type RecentReferral = {
  id: string;
  referred_name: string;
  credited: boolean;
  created_at: string;
};

export function ReferralsPanel() {
  const workspaceId = getMysticWorkspaceId();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [referrers, setReferrers] = useState<ReferrerRow[]>([]);
  const [recent, setRecent] = useState<RecentReferral[]>([]);

  useEffect(() => {
    if (!workspaceId) return;
    void fetch(`/api/mystic/referrals?workspaceId=${workspaceId}&view=dashboard&month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        setReferrers(data.dashboard?.referrers ?? []);
        setRecent(data.dashboard?.recent ?? []);
      })
      .catch(() => {
        setReferrers([]);
        setRecent([]);
      });
  }, [workspaceId, month]);

  const monthLabel = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
  }, [month]);

  return (
    <div>
      <label className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">Month</span>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-xl border border-line px-3 py-2"
        />
      </label>
      <p className="mt-2 text-sm text-muted">
        Referrals credited in {monthLabel} — pending rows count toward the next reward when visits
        confirm.
      </p>

      {referrers.length === 0 ? (
        <MysticEmptyState variant="referrals" className="mt-6" compact />
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Referrer</th>
                <th className="px-4 py-3 font-medium">This month</th>
                <th className="px-4 py-3 font-medium">Pending</th>
                <th className="px-4 py-3 font-medium">Rewarded</th>
              </tr>
            </thead>
            <tbody>
              {referrers.map((row) => (
                <tr key={row.referrerUserId} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">{row.total}</td>
                  <td className="px-4 py-3 text-muted">{row.pending}</td>
                  <td className="px-4 py-3 text-muted">{row.credited}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="mt-8 text-sm font-medium">Recent in {monthLabel}</h3>
      <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
        {recent.length === 0 ? (
          <li className="list-none p-2">
            <MysticEmptyState
              variant="referrals"
              compact
              title="No recent referrals"
              description="New sign-ups with a code will list here."
            />
          </li>
        ) : (
          recent.map((row) => (
            <li key={row.id} className="flex justify-between px-4 py-3 text-sm">
              <span>{row.referred_name}</span>
              <span className="text-muted">
                {row.credited ? 'Rewarded' : 'Pending'} ·{' '}
                {new Date(row.created_at).toLocaleDateString()}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
