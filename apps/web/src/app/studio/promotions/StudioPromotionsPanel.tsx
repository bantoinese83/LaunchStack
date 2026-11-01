'use client';

import { useCallback, useState } from 'react';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import {
  mysticCard,
  mysticInput,
  mysticStudioBtn,
  mysticStudioBtnOutline,
} from '@/components/mystic/mystic-styles';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';

type Promo = {
  id: string;
  code: string;
  label: string;
  percent_off: number | null;
  amount_off_cents: number | null;
  active: boolean;
  expires_at: string | null;
};

export function StudioPromotionsPanel() {
  const workspaceId = getMysticWorkspaceId();
  const [rows, setRows] = useState<Promo[]>([]);
  const [code, setCode] = useState('');
  const [percentOff, setPercentOff] = useState('');
  const [amountOff, setAmountOff] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    void fetch(`/api/mystic/studio/promotions?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => setRows(data.promotions ?? []))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useDeferredEffect(load, [load]);

  async function createPromo() {
    if (!workspaceId || !code.trim()) return;
    const body: Record<string, unknown> = { workspaceId, code: code.trim() };
    if (percentOff.trim()) body.percentOff = Number.parseInt(percentOff, 10);
    else if (amountOff.trim()) body.amountOffCents = Math.round(Number.parseFloat(amountOff) * 100);
    else return;

    await fetch('/api/mystic/studio/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setCode('');
    setPercentOff('');
    setAmountOff('');
    load();
  }

  async function remove(id: string) {
    if (!workspaceId) return;
    await fetch('/api/mystic/studio/promotions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, id }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div className={`${mysticCard} space-y-3 p-6`}>
        <h3 className="font-medium text-ink">New promo code</h3>
        <input
          type="text"
          placeholder="Code (e.g. HOLIDAY20)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={mysticInput}
        />
        <div className="flex flex-wrap gap-3">
          <input
            type="number"
            placeholder="% off"
            value={percentOff}
            onChange={(e) => setPercentOff(e.target.value)}
            className={`${mysticInput} w-28`}
          />
          <input
            type="text"
            inputMode="decimal"
            placeholder="Or $ off"
            value={amountOff}
            onChange={(e) => setAmountOff(e.target.value)}
            className={`${mysticInput} w-28`}
          />
        </div>
        <button type="button" onClick={() => void createPromo()} className={mysticStudioBtn}>
          Create promo
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <MysticEmptyState
          variant="shop"
          title="No promos yet"
          description="Clients enter codes at checkout; link one in a blast."
        />
      ) : (
        <ul className={`${mysticCard} divide-y divide-line/50 p-4`}>
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
            >
              <div>
                <span className="font-mono font-medium text-ink">{row.code}</span>
                <span className="text-muted">
                  {' '}
                  ·{' '}
                  {row.percent_off != null
                    ? `${row.percent_off}% off`
                    : `$${((row.amount_off_cents ?? 0) / 100).toFixed(2)} off`}
                  {!row.active ? ' · inactive' : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void remove(row.id)}
                className={mysticStudioBtnOutline}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
