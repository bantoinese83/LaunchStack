'use client';

import { useCallback, useEffect, useState } from 'react';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

type Blocked = { id: string; block_date: string; reason: string | null };

export function BlockedDatesPanel() {
  const workspaceId = getMysticWorkspaceId();
  const [rows, setRows] = useState<Blocked[]>([]);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    void fetch(`/api/mystic/blocked-dates?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => setRows(data.blockedDates ?? []));
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    if (!date) return;
    const res = await fetch('/api/mystic/blocked-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, blockDate: date, reason: reason || undefined }),
    });
    const data = await res.json();
    setMessage(res.ok ? 'Blocked' : data.error);
    if (res.ok) {
      setDate('');
      setReason('');
      load();
    }
  }

  async function remove(id: string) {
    await fetch('/api/mystic/blocked-dates', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, workspaceId }),
    });
    load();
  }

  return (
    <div className="mt-8 max-w-md space-y-3 rounded-2xl border border-line bg-surface p-6">
      <h2 className="font-medium">Blocked dates</h2>
      <p className="text-sm text-muted">Out of town — clients cannot book these days.</p>
      <div className="flex flex-wrap gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border border-line px-3 py-2 text-sm"
        />
        <input
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="min-w-[140px] flex-1 rounded-xl border border-line px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-full bg-shell px-4 py-2 text-sm text-paper"
        >
          Block
        </button>
      </div>
      <ul className="space-y-2 text-sm">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between rounded-lg bg-paper px-3 py-2"
          >
            <span>
              {row.block_date}
              {row.reason ? ` — ${row.reason}` : ''}
            </span>
            <button type="button" onClick={() => remove(row.id)} className="text-xs text-danger">
              Remove
            </button>
          </li>
        ))}
      </ul>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </div>
  );
}
