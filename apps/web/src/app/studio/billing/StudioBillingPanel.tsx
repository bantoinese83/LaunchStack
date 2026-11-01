'use client';

import { useCallback, useState } from 'react';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { StudioWorkspaceNotice } from '@/components/mystic/studio/StudioWorkspaceNotice';
import { mysticCard, mysticStudioBtnOutline } from '@/components/mystic/mystic-styles';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';

type Row = {
  userId: string;
  clientName: string;
  email: string | null;
  membershipName: string;
  blowoutsRemaining: number;
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export function StudioBillingPanel() {
  const workspaceId = getMysticWorkspaceId();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    void fetch(`/api/mystic/studio/billing?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => setRows(data.memberships ?? []))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useDeferredEffect(load, [load]);

  async function openPortal(userId: string) {
    if (!workspaceId) return;
    const res = await fetch('/api/mystic/studio/billing/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, clientUserId: userId }),
    });
    const data = await res.json();
    if (data.url) window.open(data.url, '_blank', 'noopener,noreferrer');
  }

  if (!workspaceId) return <StudioWorkspaceNotice />;

  const exportHref = `/api/mystic/studio/export?workspaceId=${workspaceId}&kind=clients`;

  return (
    <div className="space-y-4">
      <a href={exportHref} className="text-sm text-accent underline">
        Export client list (CSV)
      </a>
      {loading ? (
        <p className="text-sm text-muted">Loading memberships…</p>
      ) : rows.length === 0 ? (
        <MysticEmptyState
          variant="generic"
          title="No active memberships"
          description="Glow/Luxe rows appear after Stripe subscription checkout."
        />
      ) : (
        <ul className={`${mysticCard} divide-y divide-line/50`}>
          {rows.map((row) => (
            <li
              key={`${row.userId}-${row.membershipName}`}
              className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"
            >
              <div>
                <p className="font-medium text-ink">{row.clientName}</p>
                <p className="text-muted">
                  {row.membershipName} · {row.blowoutsRemaining} blowouts left · {row.status ?? '—'}
                  {row.cancelAtPeriodEnd ? ' · cancels at period end' : ''}
                </p>
                {row.currentPeriodEnd ? (
                  <p className="text-xs text-muted">
                    Renews / period end {new Date(row.currentPeriodEnd).toLocaleDateString()}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => void openPortal(row.userId)}
                className={mysticStudioBtnOutline}
              >
                Stripe billing portal
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
