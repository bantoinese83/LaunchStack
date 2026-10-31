'use client';

import { useCallback, useEffect, useState } from 'react';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

type Row = {
  id: string;
  starts_at: string;
  service_id: string;
  status: string;
};

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function StudioAppointmentRow({
  item,
  workspaceId,
  onUpdated,
}: {
  item: Row;
  workspaceId: string;
  onUpdated: () => void;
}) {
  const [rescheduleAt, setRescheduleAt] = useState(toLocalInputValue(item.starts_at));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const canManage = !['canceled', 'completed', 'no_show'].includes(item.status);

  async function patch(action: 'cancel' | 'reschedule') {
    setBusy(true);
    setMessage(null);
    const body: Record<string, string> = {
      workspaceId,
      appointmentId: item.id,
      action,
    };
    if (action === 'reschedule') {
      body.startsAt = new Date(rescheduleAt).toISOString();
    }
    const res = await fetch('/api/mystic/appointments/manage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok) {
      setMessage(action === 'cancel' ? 'Canceled' : 'Rescheduled');
      onUpdated();
    } else {
      setMessage(data.error ?? 'Update failed');
    }
  }

  return (
    <li className="space-y-2 rounded-lg bg-paper px-3 py-2">
      <p>
        {new Date(item.starts_at).toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit',
        })}{' '}
        · {item.service_id} · {item.status.replace(/_/g, ' ')}
      </p>
      {canManage ? (
        <div className="space-y-2 border-t border-line pt-2">
          <label className="block text-xs text-muted">
            Reschedule
            <input
              type="datetime-local"
              value={rescheduleAt}
              onChange={(e) => setRescheduleAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line px-2 py-1 text-xs"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void patch('reschedule')}
              className="rounded-full border border-line px-3 py-1 text-xs"
            >
              Save time
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void patch('cancel')}
              className="rounded-full border border-danger/40 px-3 py-1 text-xs text-danger"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      {message ? <p className="text-xs text-muted">{message}</p> : null}
    </li>
  );
}

export function StudioCalendar() {
  const [rows, setRows] = useState<Row[]>([]);
  const workspaceId = getMysticWorkspaceId();

  const reload = useCallback(() => {
    if (!workspaceId) return;
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + 14);
    void fetch(
      `/api/mystic/appointments?workspaceId=${workspaceId}&from=${from.toISOString()}&to=${to.toISOString()}`
    )
      .then((r) => r.json())
      .then((data) => setRows(data.appointments ?? []))
      .catch(() => setRows([]));
  }, [workspaceId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const byDay = rows.reduce<Record<string, Row[]>>((acc, row) => {
    const key = new Date(row.starts_at).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    acc[key] = acc[key] ?? [];
    acc[key].push(row);
    return acc;
  }, {});

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.keys(byDay).length === 0 ? (
        <MysticEmptyState variant="calendar" className="md:col-span-2 lg:col-span-3" />
      ) : (
        Object.entries(byDay).map(([day, items]) => (
          <div key={day} className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-sm font-medium">{day}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {items.map((item) => (
                <StudioAppointmentRow
                  key={item.id}
                  item={item}
                  workspaceId={workspaceId ?? ''}
                  onUpdated={reload}
                />
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
