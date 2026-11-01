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

type Row = { id: string; starts_at: string; ends_at: string; reason: string | null };

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function StudioBlockedIntervalsPanel() {
  const workspaceId = getMysticWorkspaceId();
  const [rows, setRows] = useState<Row[]>([]);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    void fetch(`/api/mystic/blocked-intervals?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => setRows(data.intervals ?? []))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useDeferredEffect(load, [load]);

  async function addBlock() {
    if (!workspaceId || !startsAt || !endsAt) return;
    await fetch('/api/mystic/blocked-intervals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        reason: reason || undefined,
      }),
    });
    setStartsAt('');
    setEndsAt('');
    setReason('');
    load();
  }

  async function remove(id: string) {
    if (!workspaceId || !window.confirm('Remove this block?')) return;
    await fetch('/api/mystic/blocked-intervals', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, id }),
    });
    load();
  }

  return (
    <div className={`${mysticCard} space-y-4 p-6`}>
      <h3 className="font-medium text-ink">Partial blocks</h3>
      <p className="text-xs text-muted">
        Block part of a day (Drybar shift, errands) without closing the whole date.
      </p>
      <label className="block text-sm">
        From
        <input
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          className={`${mysticInput} mt-1`}
        />
      </label>
      <label className="block text-sm">
        Until
        <input
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          className={`${mysticInput} mt-1`}
        />
      </label>
      <label className="block text-sm">
        Note
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className={`${mysticInput} mt-1`}
          placeholder="Optional"
        />
      </label>
      <button type="button" onClick={() => void addBlock()} className={mysticStudioBtn}>
        Add block
      </button>
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <MysticEmptyState
          variant="visits"
          compact
          title="No partial blocks"
          description="Whole-day blocks stay under blocked dates."
        />
      ) : (
        <ul className="space-y-2 text-sm">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 border-t border-line/50 pt-2"
            >
              <span>
                {new Date(row.starts_at).toLocaleString()} –{' '}
                {new Date(row.ends_at).toLocaleString()}
                {row.reason ? ` · ${row.reason}` : ''}
              </span>
              <button
                type="button"
                onClick={() => void remove(row.id)}
                className={mysticStudioBtnOutline}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
