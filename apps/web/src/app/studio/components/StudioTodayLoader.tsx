'use client';

import { useCallback, useEffect, useState } from 'react';
import { studioWeekBoardRangeIso } from '@template/mystic';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';
import { StudioWorkspaceNotice } from '@/components/mystic/studio/StudioWorkspaceNotice';
import { StudioOpsPanel } from './StudioOpsPanel';
import { StudioTodayMap } from './StudioTodayMap';

type Appointment = {
  id: string;
  starts_at: string;
  service_id: string;
  status: string;
  client_user_id: string;
  address?: Record<string, unknown>;
  stylist_latitude?: number | null;
  stylist_longitude?: number | null;
};

type ClientRow = { user_id: string; full_name: string | null };

const REFRESH_MS = 45_000;

export function StudioTodayLoader() {
  const workspaceId = getMysticWorkspaceId();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [clientsById, setClientsById] = useState<Record<string, ClientRow>>({});

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const workspaceId = getMysticWorkspaceId();
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    if (!opts?.silent) setLoading(true);
    const { from, to } = studioWeekBoardRangeIso();
    try {
      const res = await fetch(
        `/api/mystic/appointments?workspaceId=${workspaceId}&from=${from}&to=${to}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not load today’s board');
        if (!opts?.silent) setAppointments([]);
      } else {
        setError(null);
        setAppointments(data.appointments ?? []);
        setLastFetchedAt(Date.now());
      }
    } catch {
      setError('Could not load today’s board');
      if (!opts?.silent) setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useDeferredEffect(() => void load(), [load]);

  useEffect(() => {
    if (!workspaceId) return;
    void fetch(`/api/mystic/clients?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, ClientRow> = {};
        for (const c of (data.clients ?? []) as ClientRow[]) map[c.user_id] = c;
        setClientsById(map);
      });
  }, [workspaceId]);

  useEffect(() => {
    const id = setInterval(() => void load({ silent: true }), REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') void load({ silent: true });
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  if (!workspaceId) {
    return <StudioWorkspaceNotice />;
  }

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {lastFetchedAt ? (
        <p className="text-xs text-muted">
          Auto-refreshes · last sync{' '}
          {new Date(lastFetchedAt).toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      ) : null}
      <StudioTodayMap appointments={appointments} clientsById={clientsById} />
      <StudioOpsPanel
        initialAppointments={appointments}
        onRefreshBoard={() => void load()}
        boardLoading={loading}
      />
    </div>
  );
}
