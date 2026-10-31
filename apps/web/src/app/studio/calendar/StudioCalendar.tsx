'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import {
  formatAddressLine,
  getServiceById,
  visitStatusLabel,
  type ServiceId,
} from '@template/mystic';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { MysticVisitStatusBadge } from '@/components/mystic/MysticVisitStatusBadge';
import { MysticUserAvatar } from '@/components/mystic/MysticUserAvatar';
import { StudioLoadingRows } from '@/components/mystic/studio/StudioLoadingRows';
import { StudioWorkspaceNotice } from '@/components/mystic/studio/StudioWorkspaceNotice';
import { mysticCard, mysticInput, mysticStudioBtnOutline } from '@/components/mystic/mystic-styles';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';

type Row = {
  id: string;
  starts_at: string;
  service_id: string;
  status: string;
  client_user_id: string;
  address?: Record<string, unknown>;
};

type ClientRow = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url?: string | null;
};

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function StudioAppointmentRow({
  item,
  workspaceId,
  clientName,
  clientAvatarUrl,
  onUpdated,
}: {
  item: Row;
  workspaceId: string;
  clientName: string;
  clientAvatarUrl?: string | null;
  onUpdated: () => void;
}) {
  const [rescheduleAt, setRescheduleAt] = useState(toLocalInputValue(item.starts_at));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const canManage = !['canceled', 'completed', 'no_show'].includes(item.status);

  let serviceName = item.service_id.replace(/_/g, ' ');
  try {
    serviceName = getServiceById(item.service_id as ServiceId).name;
  } catch {
    /* keep id */
  }
  const addressLine = formatAddressLine(item.address);

  async function patch(action: 'cancel' | 'reschedule') {
    if (
      action === 'cancel' &&
      !window.confirm('Cancel this visit? The client should be notified separately if needed.')
    ) {
      return;
    }
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
    <li className={`${mysticCard} space-y-2 p-3`}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-ink">
          {new Date(item.starts_at).toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
        <MysticVisitStatusBadge status={item.status} />
      </div>
      <p className="text-sm text-ink">{serviceName}</p>
      <div className="flex items-center gap-2">
        <MysticUserAvatar url={clientAvatarUrl} name={clientName} size={24} />
        <p className="text-xs text-muted">{clientName}</p>
      </div>
      {addressLine ? <p className="text-xs text-muted">{addressLine}</p> : null}
      <p className="text-xs text-chalk">{visitStatusLabel(item.status)}</p>
      <Link
        href={`/studio/messages?client=${item.client_user_id}`}
        className="inline-block text-xs text-accent underline"
      >
        Message client
      </Link>
      {canManage ? (
        <div className="space-y-2 border-t border-line/80 pt-2">
          <label className="block text-xs text-muted">
            Reschedule
            <input
              type="datetime-local"
              value={rescheduleAt}
              onChange={(e) => setRescheduleAt(e.target.value)}
              className={`${mysticInput} mt-1 px-2 py-1.5 text-xs`}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void patch('reschedule')}
              className={`${mysticStudioBtnOutline} disabled:opacity-50`}
            >
              Save time
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void patch('cancel')}
              className="rounded-full border border-danger/40 px-4 py-2 text-xs text-danger disabled:opacity-50"
            >
              Cancel visit
            </button>
          </div>
        </div>
      ) : null}
      {message ? (
        <p
          className={`text-xs ${message.includes('failed') || message.includes('Failed') ? 'text-danger' : 'text-chalk'}`}
        >
          {message}
        </p>
      ) : null}
    </li>
  );
}

const RANGE_DAYS = 7;

export function StudioCalendar() {
  const workspaceId = getMysticWorkspaceId();
  const [rows, setRows] = useState<Row[]>([]);
  const [clientById, setClientById] = useState<Record<string, ClientRow>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + RANGE_DAYS);
    to.setHours(23, 59, 59, 999);
    void fetch(
      `/api/mystic/appointments?workspaceId=${workspaceId}&from=${from.toISOString()}&to=${to.toISOString()}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setRows(data.appointments ?? []);
      })
      .catch(() => setError('Could not load calendar'))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useDeferredEffect(reload, [reload]);

  useDeferredEffect(() => {
    if (!workspaceId) return;
    void fetch(`/api/mystic/clients?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, ClientRow> = {};
        for (const c of (data.clients ?? []) as ClientRow[]) map[c.user_id] = c;
        setClientById(map);
      });
  }, [workspaceId]);

  const byDay = useMemo(() => {
    const acc: Record<string, { sort: number; rows: Row[] }> = {};
    for (const row of rows) {
      const d = new Date(row.starts_at);
      const sort = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const key = d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      if (!acc[key]) acc[key] = { sort, rows: [] };
      acc[key].rows.push(row);
    }
    for (const entry of Object.values(acc)) {
      entry.rows.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
    }
    return Object.entries(acc).sort((a, b) => a[1].sort - b[1].sort);
  }, [rows]);

  function clientLabel(userId: string) {
    const c = clientById[userId];
    return c?.full_name ?? c?.email ?? `Client ${userId.slice(0, 8)}`;
  }

  if (!workspaceId) {
    return <StudioWorkspaceNotice />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span>
          Next {RANGE_DAYS} days · {rows.length} visit{rows.length === 1 ? '' : 's'}
        </span>
        <button
          type="button"
          onClick={reload}
          disabled={loading}
          className="text-accent underline disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {loading && rows.length === 0 ? <StudioLoadingRows count={3} /> : null}
      {!loading && byDay.length === 0 && !error ? (
        <MysticEmptyState variant="calendar" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {byDay.map(([day, { rows: items }]) => (
            <div key={day} className={`${mysticCard} p-4`}>
              <p className="text-sm font-medium text-ink">{day}</p>
              <p className="text-xs text-muted">
                {items.length} visit{items.length === 1 ? '' : 's'}
              </p>
              <ul className="mt-3 space-y-2">
                {items.map((item) => {
                  const client = clientById[item.client_user_id];
                  return (
                    <StudioAppointmentRow
                      key={item.id}
                      item={item}
                      workspaceId={workspaceId}
                      clientName={clientLabel(item.client_user_id)}
                      clientAvatarUrl={client?.avatar_url}
                      onUpdated={reload}
                    />
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
