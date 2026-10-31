'use client';

import { useCallback, useState } from 'react';
import { StudioWorkspaceNotice } from '@/components/mystic/studio/StudioWorkspaceNotice';
import {
  mysticCard,
  mysticInput,
  mysticStudioBtn,
  mysticStudioBtnOutline,
} from '@/components/mystic/mystic-styles';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';

type Blocked = { id: string; block_date: string; reason: string | null };

export function BlockedDatesPanel() {
  const workspaceId = getMysticWorkspaceId();
  const [rows, setRows] = useState<Blocked[]>([]);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void fetch(`/api/mystic/blocked-dates?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => setRows(data.blockedDates ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useDeferredEffect(load, [load]);

  async function add() {
    if (!date || !workspaceId) return;
    setBusy(true);
    setMessage(null);
    const res = await fetch('/api/mystic/blocked-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, blockDate: date, reason: reason.trim() || undefined }),
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok) {
      setMessage({ kind: 'ok', text: 'Date blocked — clients cannot book this day.' });
      setDate('');
      setReason('');
      load();
    } else {
      setMessage({ kind: 'error', text: data.error ?? 'Could not block date' });
    }
  }

  async function remove(id: string) {
    if (!workspaceId) return;
    if (!window.confirm('Remove this blocked date?')) return;
    setBusy(true);
    await fetch('/api/mystic/blocked-dates', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, workspaceId }),
    });
    setBusy(false);
    load();
  }

  if (!workspaceId) {
    return <StudioWorkspaceNotice />;
  }

  return (
    <div className={`${mysticCard} max-w-lg space-y-4 p-6`}>
      <div>
        <h3 className="font-medium text-ink">Blocked dates</h3>
        <p className="mt-1 text-sm text-muted">
          Out of town — clients cannot book these days online.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`${mysticInput} w-auto min-w-[10rem]`}
        />
        <input
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className={`${mysticInput} min-w-[140px] flex-1`}
        />
        <button
          type="button"
          onClick={() => void add()}
          disabled={busy || !date}
          className={`${mysticStudioBtn} disabled:opacity-50`}
        >
          Block day
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-muted">Loading blocked dates…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted">No blocked dates — your calendar is open.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-line/80 bg-paper px-3 py-2"
            >
              <span className="text-ink">
                {row.block_date}
                {row.reason ? ` — ${row.reason}` : ''}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => void remove(row.id)}
                className={`${mysticStudioBtnOutline} border-danger/40 text-danger`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {message ? (
        <p className={`text-sm ${message.kind === 'ok' ? 'text-chalk' : 'text-danger'}`}>
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
