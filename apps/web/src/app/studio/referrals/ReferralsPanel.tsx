'use client';

import { useCallback, useMemo, useState } from 'react';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { StudioLoadingRows } from '@/components/mystic/studio/StudioLoadingRows';
import { StudioWorkspaceNotice } from '@/components/mystic/studio/StudioWorkspaceNotice';
import { mysticCard, mysticInput } from '@/components/mystic/mystic-styles';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referrerCode, setReferrerCode] = useState('');
  const [referredName, setReferredName] = useState('');
  const [logging, setLogging] = useState(false);
  const [logStatus, setLogStatus] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    void fetch(`/api/mystic/referrals?workspaceId=${workspaceId}&view=dashboard&month=${month}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || data.error) {
          setError(data.error ?? 'Could not load referrals');
          return;
        }
        setReferrers(data.dashboard?.referrers ?? []);
        setRecent(data.dashboard?.recent ?? []);
      })
      .catch(() => setError('Could not load referrals'))
      .finally(() => setLoading(false));
  }, [workspaceId, month]);

  useDeferredEffect(load, [load]);

  const monthLabel = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
  }, [month]);

  async function logManualReferral(e: React.FormEvent) {
    e.preventDefault();
    if (!workspaceId) return;
    setLogging(true);
    setLogStatus(null);
    try {
      const res = await fetch('/api/mystic/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          referrerCode: referrerCode.trim().toUpperCase(),
          referredName: referredName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLogStatus(data.error ?? 'Could not save referral');
        return;
      }
      setReferrerCode('');
      setReferredName('');
      setLogStatus(
        data.untilReward === 0
          ? 'Saved — reward threshold met for this referrer'
          : `Saved — ${data.untilReward} more until next blowout reward`
      );
      load();
    } catch {
      setLogStatus('Network error — try again');
    } finally {
      setLogging(false);
    }
  }

  if (!workspaceId) {
    return <StudioWorkspaceNotice />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="block text-sm">
          <span className="text-muted">Month</span>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={`${mysticInput} mt-1 max-w-xs`}
          />
        </label>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="text-sm text-accent underline disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      <p className="text-sm text-muted">
        Referrals in {monthLabel}. Pending rows count toward the next free blowout after the
        referred client&apos;s booking is confirmed. Rewards use lifetime pending totals.
      </p>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {loading && referrers.length === 0 ? <StudioLoadingRows count={2} /> : null}

      {!loading && referrers.length === 0 && !error ? (
        <MysticEmptyState variant="referrals" compact />
      ) : referrers.length > 0 ? (
        <div className={`${mysticCard} overflow-x-auto p-0`}>
          <table className="w-full min-w-[480px] text-left text-sm">
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
                  <td className="px-4 py-3 font-medium text-ink">{row.name}</td>
                  <td className="px-4 py-3 tabular-nums">{row.total}</td>
                  <td className="px-4 py-3 tabular-nums text-muted">{row.pending}</td>
                  <td className="px-4 py-3 tabular-nums text-muted">{row.credited}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <form onSubmit={(e) => void logManualReferral(e)} className={`${mysticCard} space-y-3 p-4`}>
        <h3 className="text-sm font-medium text-ink">Log a referral</h3>
        <p className="text-xs text-muted">
          Use when someone books by name or walk-in and you already know who sent them.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted">Referrer code</span>
            <input
              value={referrerCode}
              onChange={(e) => setReferrerCode(e.target.value.toUpperCase())}
              className={`${mysticInput} mt-1`}
              placeholder="MYSTIC•••••"
              required
              maxLength={16}
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Referred client name</span>
            <input
              value={referredName}
              onChange={(e) => setReferredName(e.target.value)}
              className={`${mysticInput} mt-1`}
              placeholder="First & last"
              required
              minLength={2}
              maxLength={120}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={logging}
          className="text-sm font-medium text-accent underline disabled:opacity-50"
        >
          {logging ? 'Saving…' : 'Save referral'}
        </button>
        {logStatus ? <p className="text-sm text-muted">{logStatus}</p> : null}
      </form>

      <div>
        <h3 className="text-sm font-medium text-ink">Recent in {monthLabel}</h3>
        <ul className={`${mysticCard} mt-3 divide-y divide-line/80 overflow-hidden p-0`}>
          {loading && recent.length === 0 ? (
            <li className="p-4 text-sm text-muted">Loading…</li>
          ) : recent.length === 0 ? (
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
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="font-medium text-ink">{row.referred_name}</span>
                <span className="text-muted">
                  {row.credited ? 'Rewarded' : 'Pending'} ·{' '}
                  {new Date(row.created_at).toLocaleDateString()}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
