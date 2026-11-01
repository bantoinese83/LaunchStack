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
import { MysticUserAvatar } from '@/components/mystic/MysticUserAvatar';
import { StudioLoadingRows } from '@/components/mystic/studio/StudioLoadingRows';
import { StudioWorkspaceNotice } from '@/components/mystic/studio/StudioWorkspaceNotice';
import { mysticInput, mysticStudioBtnOutline } from '@/components/mystic/mystic-styles';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';

type Row = {
  id: string;
  starts_at: string;
  service_id: string;
  status: string;
  client_user_id: string;
  duration_minutes?: number;
  address?: Record<string, unknown>;
};

type ClientRow = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url?: string | null;
};

type ViewMode = 'month' | 'day';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const HOUR_PX = 56;
const MAX_PILLS = 3;

const STATUS_PILL: Record<string, string> = {
  confirmed: 'bg-gold-soft text-ink',
  stylist_en_route: 'bg-accent-soft text-accent',
  door_timer_active: 'bg-danger/15 text-danger',
  pending: 'bg-paper text-muted ring-1 ring-line',
  stylist_arrived: 'bg-plum/10 text-plum',
  in_progress: 'bg-accent/20 text-ink',
  completed: 'bg-surface text-muted',
  canceled: 'bg-surface text-muted line-through',
  no_show: 'bg-surface text-muted',
};

const STATUS_BLOCK: Record<string, string> = {
  confirmed: 'border-gold/50 bg-gold-soft text-ink',
  stylist_en_route: 'border-accent/50 bg-accent-soft text-accent',
  door_timer_active: 'border-danger/40 bg-danger/10 text-danger',
  pending: 'border-line bg-paper text-muted',
  stylist_arrived: 'border-plum/30 bg-plum/10 text-plum',
  in_progress: 'border-accent/40 bg-accent/15 text-ink',
  completed: 'border-line/80 bg-surface text-muted',
  canceled: 'border-line/60 bg-surface/80 text-muted line-through',
  no_show: 'border-line/60 bg-surface text-muted',
};

const LEGEND = [
  { label: 'Confirmed', swatch: 'bg-gold-soft' },
  { label: 'En route', swatch: 'bg-accent-soft' },
  { label: 'Door timer', swatch: 'bg-danger/15' },
  { label: 'Pending pay', swatch: 'bg-paper ring-1 ring-line' },
] as const;

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function startOfLocalDay(d: Date) {
  const next = new Date(d);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function sameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function serviceLabel(serviceId: string) {
  try {
    return getServiceById(serviceId as ServiceId).name;
  } catch {
    return serviceId.replace(/_/g, ' ');
  }
}

function defaultDuration(serviceId: string, fallback?: number) {
  if (typeof fallback === 'number' && fallback > 0) return fallback;
  try {
    return getServiceById(serviceId as ServiceId).durationMinutes;
  } catch {
    return 60;
  }
}

function minutesFromDayStart(iso: string) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function formatHourLabel(hour: number) {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric' });
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** 6×7 month grid cells (leading/trailing days from adjacent months). */
function buildMonthCells(month: Date) {
  const first = startOfMonth(month);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
}

export function StudioCalendar() {
  const workspaceId = getMysticWorkspaceId();
  const [rows, setRows] = useState<Row[]>([]);
  const [clientById, setClientById] = useState<Record<string, ClientRow>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('month');
  const [cursor, setCursor] = useState(() => startOfLocalDay(new Date()));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rescheduleAt, setRescheduleAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const month = useMemo(() => startOfMonth(cursor), [cursor]);

  const reload = useCallback(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const from = new Date(month.getFullYear(), month.getMonth(), 1);
    from.setHours(0, 0, 0, 0);
    const to = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    to.setHours(23, 59, 59, 999);
    // Include a few days of spill for month edges when viewing day near month boundary
    from.setDate(from.getDate() - 7);
    to.setDate(to.getDate() + 7);
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
  }, [workspaceId, month]);

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
    const map = new Map<string, Row[]>();
    for (const row of rows) {
      const key = dayKey(new Date(row.starts_at));
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
    }
    return map;
  }, [rows]);

  const monthCells = useMemo(() => buildMonthCells(month), [month]);

  const dayRows = useMemo(() => {
    return (byDay.get(dayKey(cursor)) ?? []).slice();
  }, [byDay, cursor]);

  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);

  const hours = useMemo(() => {
    const list: number[] = [];
    for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h += 1) list.push(h);
    return list;
  }, []);

  const gridHeight = hours.length * HOUR_PX;
  const now = new Date();
  const showNow =
    sameLocalDay(now, cursor) && now.getHours() >= DAY_START_HOUR && now.getHours() < DAY_END_HOUR;
  const nowTop = ((now.getHours() * 60 + now.getMinutes() - DAY_START_HOUR * 60) / 60) * HOUR_PX;

  const monthTitle = month.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
  const dayTitle = cursor.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  function clientLabel(userId: string) {
    const c = clientById[userId];
    return c?.full_name ?? c?.email ?? `Client ${userId.slice(0, 8)}`;
  }

  function goToday() {
    const today = startOfLocalDay(new Date());
    setCursor(today);
    setSelectedId(null);
    setMessage(null);
  }

  function shiftMonth(delta: number) {
    const next = new Date(month.getFullYear(), month.getMonth() + delta, 1);
    setCursor(startOfLocalDay(next));
    setSelectedId(null);
    setMessage(null);
  }

  function shiftDay(delta: number) {
    const next = new Date(cursor);
    next.setDate(next.getDate() + delta);
    setCursor(startOfLocalDay(next));
    setSelectedId(null);
    setMessage(null);
  }

  function openDay(day: Date) {
    setCursor(startOfLocalDay(day));
    setView('day');
    setSelectedId(null);
    setMessage(null);
  }

  function openVisit(row: Row) {
    setSelectedId(row.id);
    setRescheduleAt(toLocalInputValue(row.starts_at));
    setMessage(null);
  }

  async function patch(action: 'cancel' | 'reschedule') {
    if (!selected || !workspaceId) return;
    if (
      action === 'cancel' &&
      !window.confirm('Cancel this visit? Message the client separately if needed.')
    ) {
      return;
    }
    setBusy(true);
    setMessage(null);
    const body: Record<string, string> = {
      workspaceId,
      appointmentId: selected.id,
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
      reload();
    } else {
      setMessage(data.error ?? 'Update failed');
    }
  }

  if (!workspaceId) {
    return <StudioWorkspaceNotice />;
  }

  const canManageSelected =
    selected && !['canceled', 'completed', 'no_show'].includes(selected.status);
  const isToday = sameLocalDay(cursor, new Date());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={goToday}
            className="rounded-full border border-line/80 px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface"
          >
            Today
          </button>
          <div
            className="flex rounded-full border border-line/80 p-0.5"
            role="tablist"
            aria-label="Calendar view"
          >
            {(['month', 'day'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={view === mode}
                onClick={() => setView(mode)}
                className={
                  view === mode
                    ? 'rounded-full bg-shell px-3 py-1 text-xs font-medium capitalize text-paper'
                    : 'rounded-full px-3 py-1 text-xs font-medium capitalize text-muted hover:text-ink'
                }
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={view === 'month' ? 'Previous month' : 'Previous day'}
              onClick={() => (view === 'month' ? shiftMonth(-1) : shiftDay(-1))}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line/80 text-ink hover:bg-surface"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label={view === 'month' ? 'Next month' : 'Next day'}
              onClick={() => (view === 'month' ? shiftMonth(1) : shiftDay(1))}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line/80 text-ink hover:bg-surface"
            >
              ›
            </button>
          </div>
          <h2 className="font-display text-lg font-medium tracking-tight text-ink sm:text-xl">
            {view === 'month' ? monthTitle : dayTitle}
          </h2>
        </div>
        <button
          type="button"
          onClick={reload}
          disabled={loading}
          className="text-sm font-medium text-accent underline underline-offset-2 disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {loading && rows.length === 0 ? <StudioLoadingRows count={4} /> : null}

      {view === 'month' && (!loading || rows.length > 0) ? (
        <div className="overflow-hidden rounded-2xl border border-line/80 bg-surface/95">
          <div className="grid grid-cols-7 border-b border-line/70">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="px-2 py-2.5 text-center text-[11px] font-medium uppercase tracking-wide text-muted"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthCells.map((day) => {
              const inMonth = day.getMonth() === month.getMonth();
              const key = dayKey(day);
              const events = byDay.get(key) ?? [];
              const today = sameLocalDay(day, now);
              const selectedDay = sameLocalDay(day, cursor);
              const shown = events.slice(0, MAX_PILLS);
              const more = events.length - shown.length;
              return (
                <div
                  key={key}
                  className={`min-h-[7.5rem] border-b border-r border-line/50 p-1.5 sm:min-h-[8.5rem] sm:p-2 ${
                    inMonth ? 'bg-transparent' : 'bg-paper/40'
                  } ${selectedDay ? 'bg-gold-soft/40' : ''}`}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => openDay(day)}
                      aria-label={`Open ${day.toLocaleDateString()}`}
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm tabular-nums transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 ${
                        today
                          ? 'bg-shell font-semibold text-paper'
                          : inMonth
                            ? 'font-medium text-ink'
                            : 'text-muted'
                      }`}
                    >
                      {day.getDate()}
                    </button>
                    {events.length > 0 ? (
                      <span className="text-[10px] tabular-nums text-muted">{events.length}</span>
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    {shown.map((row) => {
                      const time = new Date(row.starts_at).toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                      });
                      return (
                        <button
                          key={row.id}
                          type="button"
                          onClick={() => {
                            setCursor(startOfLocalDay(day));
                            openVisit(row);
                          }}
                          className={`block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[10px] font-medium leading-tight sm:text-[11px] ${
                            STATUS_PILL[row.status] ?? 'bg-surface text-ink'
                          }`}
                          title={`${serviceLabel(row.service_id)} · ${clientLabel(row.client_user_id)} · ${time}`}
                        >
                          <span className="hidden sm:inline">{time} </span>
                          {serviceLabel(row.service_id)}
                        </button>
                      );
                    })}
                    {more > 0 ? (
                      <button
                        type="button"
                        onClick={() => openDay(day)}
                        className="px-1 text-[10px] font-medium text-muted hover:text-ink"
                      >
                        +{more} more
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-line/70 px-4 py-3">
            {LEGEND.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs text-muted">
                <span className={`h-2.5 w-2.5 rounded-full ${item.swatch}`} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {view === 'day' && (!loading || rows.length > 0) ? (
        <div className="overflow-hidden rounded-2xl border border-line/80 bg-surface/95">
          <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] border-b border-line/70">
            <div className="border-r border-line/70 px-2 py-3 text-[10px] uppercase tracking-wide text-muted">
              Time
            </div>
            <div className="px-4 py-3 text-sm font-medium text-ink">
              House calls
              <span className="ml-2 text-xs font-normal text-muted">
                {dayRows.length} visit{dayRows.length === 1 ? '' : 's'}
                {isToday ? ' · today' : ''}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-[4.5rem_minmax(0,1fr)]">
            <div className="relative border-r border-line/70" style={{ height: gridHeight }}>
              {hours.map((hour) => {
                const top = (hour - DAY_START_HOUR) * HOUR_PX;
                return (
                  <div
                    key={hour}
                    className="absolute right-2 text-[11px] tabular-nums text-muted"
                    style={{
                      top: hour === DAY_START_HOUR ? 6 : top,
                      transform: hour === DAY_START_HOUR ? undefined : 'translateY(-50%)',
                    }}
                  >
                    {formatHourLabel(hour)}
                  </div>
                );
              })}
            </div>
            <div className="relative" style={{ height: gridHeight }}>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute inset-x-0 border-t border-line/50"
                  style={{ top: (hour - DAY_START_HOUR) * HOUR_PX }}
                />
              ))}
              {showNow ? (
                <div
                  className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
                  style={{ top: nowTop }}
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-danger" />
                  <span className="h-px flex-1 bg-danger/80" />
                </div>
              ) : null}
              {dayRows.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center px-6">
                  <p className="text-sm text-muted">No house calls this day.</p>
                </div>
              ) : (
                dayRows.map((row) => {
                  const startMin = minutesFromDayStart(row.starts_at);
                  const duration = defaultDuration(row.service_id, row.duration_minutes);
                  const top = ((startMin - DAY_START_HOUR * 60) / 60) * HOUR_PX;
                  const height = Math.max((duration / 60) * HOUR_PX, 36);
                  const client = clientById[row.client_user_id];
                  const name = clientLabel(row.client_user_id);
                  const active = selectedId === row.id;
                  const startLabel = new Date(row.starts_at).toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit',
                  });
                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => openVisit(row)}
                      className={`absolute left-2 right-2 z-10 overflow-hidden rounded-xl border px-3 py-2 text-left shadow-sm transition hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 ${
                        STATUS_BLOCK[row.status] ?? 'border-line bg-surface text-ink'
                      } ${active ? 'ring-2 ring-accent/50' : ''}`}
                      style={{ top: Math.max(top, 0), height }}
                    >
                      <div className="flex items-start gap-2">
                        <MysticUserAvatar
                          url={client?.avatar_url}
                          name={name}
                          size={30}
                          className="mt-0.5 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold">
                            {visitStatusLabel(row.status)} · {name}
                          </p>
                          <p className="truncate text-[11px] opacity-80">
                            {serviceLabel(row.service_id)} · {startLabel} · {duration}m
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-line/70 px-4 py-3">
            {LEGEND.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs text-muted">
                <span className={`h-2.5 w-2.5 rounded-full ${item.swatch}`} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!loading && rows.length === 0 && !error ? <MysticEmptyState variant="calendar" /> : null}

      {selected ? (
        <div className="rounded-2xl border border-line/80 bg-surface/95 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">
                {serviceLabel(selected.service_id)} · {clientLabel(selected.client_user_id)}
              </p>
              <p className="mt-1 text-xs text-muted">{visitStatusLabel(selected.status)}</p>
              {formatAddressLine(selected.address) ? (
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {formatAddressLine(selected.address)}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="text-xs font-medium text-muted underline"
            >
              Close
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href={`/studio/messages?client=${selected.client_user_id}`}
              className="text-xs font-medium text-accent underline underline-offset-2"
            >
              Message client
            </Link>
            {view === 'month' ? (
              <button
                type="button"
                onClick={() => {
                  setCursor(startOfLocalDay(new Date(selected.starts_at)));
                  setView('day');
                }}
                className="text-xs font-medium text-muted underline underline-offset-2"
              >
                Open day timeline
              </button>
            ) : null}
          </div>
          {canManageSelected ? (
            <div className="mt-4 grid gap-2 border-t border-line/60 pt-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
              <label className="block min-w-0 text-xs text-muted">
                New time
                <input
                  type="datetime-local"
                  value={rescheduleAt}
                  onChange={(e) => setRescheduleAt(e.target.value)}
                  className={`${mysticInput} mt-1 w-full py-2 text-xs`}
                />
              </label>
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
          ) : null}
          {message ? (
            <p
              className={`mt-3 text-xs ${
                message.toLowerCase().includes('fail') ? 'text-danger' : 'text-chalk'
              }`}
            >
              {message}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
