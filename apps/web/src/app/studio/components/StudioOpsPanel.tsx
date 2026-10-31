'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  addressLatLng,
  chunkIds,
  formatAddressLine,
  formatAppointmentTagLabels,
  formatVisitWhen,
  googleMapsDirectionsUrl,
  getServiceById,
  isVisitLiveTracking,
  type ServiceId,
} from '@template/mystic';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { StudioWorkspaceNotice } from '@/components/mystic/studio/StudioWorkspaceNotice';
import { MysticInspoGallery, type InspoPhoto } from '@/components/mystic/MysticInspoGallery';
import { MysticVisitStatusBadge } from '@/components/mystic/MysticVisitStatusBadge';
import { MysticUserAvatar } from '@/components/mystic/MysticUserAvatar';
import {
  mysticCard,
  mysticInput,
  mysticStudioBtn,
  mysticStudioBtnOutline,
} from '@/components/mystic/mystic-styles';

type Appointment = {
  id: string;
  starts_at: string;
  service_id: string;
  status: string;
  client_user_id: string;
  address?: Record<string, unknown>;
  tags?: string[];
  client_notes?: string | null;
};

type ClientRow = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url?: string | null;
};

async function readBrowserCoords(): Promise<{ latitude: number; longitude: number } | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return null;
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 8000,
      });
    });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch {
    return null;
  }
}

export function StudioOpsPanel({
  initialAppointments,
  onRefreshBoard,
  boardLoading,
}: {
  initialAppointments: Appointment[];
  onRefreshBoard?: () => void;
  boardLoading?: boolean;
}) {
  const workspaceId = getMysticWorkspaceId();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [clientById, setClientById] = useState<Record<string, ClientRow>>({});
  const [eta, setEta] = useState(20);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [inspoByAppointment, setInspoByAppointment] = useState<Record<string, InspoPhoto[]>>({});

  useDeferredEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);

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

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const liveA = isVisitLiveTracking(a.status) ? 0 : 1;
      const liveB = isVisitLiveTracking(b.status) ? 0 : 1;
      if (liveA !== liveB) return liveA - liveB;
      return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
    });
  }, [appointments]);

  const appointmentIds = useMemo(() => appointments.map((a) => a.id).join(','), [appointments]);

  useDeferredEffect(() => {
    if (!appointmentIds) {
      setInspoByAppointment({});
      return;
    }
    // One request per batch of visits — previously one request per visit, each of
    // which re-authenticated, and it re-ran on every 45s board refresh.
    void Promise.all(
      chunkIds(appointmentIds.split(',')).map(async (batch) => {
        const res = await fetch(`/api/mystic/appointments/inspo?appointmentIds=${batch.join(',')}`);
        if (!res.ok) return null;
        const data = await res.json();
        return (data.photosByAppointment ?? {}) as Record<string, InspoPhoto[]>;
      })
    )
      .then((results) => {
        const parts = results.filter((r): r is Record<string, InspoPhoto[]> => r !== null);
        // Any failed batch: keep the last known thumbnails rather than blanking them.
        if (parts.length !== results.length) return;
        setInspoByAppointment(Object.assign({}, ...parts));
      })
      .catch(() => {
        /* keep the last known thumbnails */
      });
  }, [appointmentIds]);

  async function enRoute(appointmentId: string) {
    setBusyId(appointmentId);
    setBusyAction('enRoute');
    setMessage(null);
    const coords = await readBrowserCoords();
    const res = await fetch('/api/mystic/appointments/en-route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentId,
        etaMinutes: eta,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      }),
    });
    const data = await res.json();
    setBusyId(null);
    setBusyAction(null);
    if (!res.ok) {
      setMessage(data.error ?? 'Failed');
      return;
    }
    setAppointments((rows) =>
      rows.map((row) => (row.id === appointmentId ? { ...row, status: 'stylist_en_route' } : row))
    );
    setMessage(
      coords
        ? 'Client notified — on the way with live map'
        : 'Client notified — allow location to share live map'
    );
    onRefreshBoard?.();
  }

  async function shareLive(appointmentId: string) {
    setBusyId(appointmentId);
    setBusyAction('shareLive');
    setMessage(null);
    const coords = await readBrowserCoords();
    if (!coords) {
      setBusyId(null);
      setBusyAction(null);
      setMessage('Allow location to update the live map');
      return;
    }
    const res = await fetch('/api/mystic/appointments/share-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentId,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }),
    });
    const data = await res.json();
    setBusyId(null);
    setBusyAction(null);
    if (!res.ok) {
      setMessage(data.error ?? 'Update failed');
      return;
    }
    setMessage('Live map updated for client');
  }

  async function completeVisit(appointmentId: string) {
    setBusyId(appointmentId);
    setBusyAction('complete');
    setMessage(null);
    const res = await fetch('/api/mystic/appointments/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId }),
    });
    const data = await res.json();
    setBusyId(null);
    setBusyAction(null);
    if (!res.ok) {
      setMessage(data.error ?? 'Failed');
      return;
    }
    setAppointments((rows) =>
      rows.map((row) => (row.id === appointmentId ? { ...row, status: 'completed' } : row))
    );
    setMessage('Visit complete — payment captured');
    onRefreshBoard?.();
  }

  async function noShow(appointmentId: string) {
    setBusyId(appointmentId);
    setBusyAction('noShow');
    setMessage(null);
    const res = await fetch('/api/mystic/appointments/no-show', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId }),
    });
    const data = await res.json();
    setBusyId(null);
    setBusyAction(null);
    if (!res.ok) {
      setMessage(data.error ?? 'Failed');
      return;
    }
    setMessage('Marked no-show — deposit capture attempted');
    onRefreshBoard?.();
  }

  async function doorTimer(appointmentId: string) {
    setBusyId(appointmentId);
    setBusyAction('doorTimer');
    setMessage(null);
    const res = await fetch('/api/mystic/appointments/door-timer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId }),
    });
    const data = await res.json();
    setBusyId(null);
    setBusyAction(null);
    if (!res.ok) {
      setMessage(data.error ?? 'Failed');
      return;
    }
    setAppointments((rows) =>
      rows.map((row) => (row.id === appointmentId ? { ...row, status: 'door_timer_active' } : row))
    );
    setMessage(`Door timer started (${data.doorTimerMinutes} min)`);
  }

  function clientLabel(clientUserId: string) {
    const c = clientById[clientUserId];
    return c?.full_name ?? c?.email ?? `Client ${clientUserId.slice(0, 8)}`;
  }

  if (!workspaceId) {
    return <StudioWorkspaceNotice />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          ETA (minutes)
          <input
            type="number"
            value={eta}
            onChange={(e) => setEta(Number(e.target.value))}
            className={`${mysticInput} w-20 px-2 py-1`}
          />
        </label>
        {onRefreshBoard ? (
          <button
            type="button"
            onClick={onRefreshBoard}
            disabled={boardLoading}
            className="text-sm text-accent underline disabled:opacity-50"
          >
            {boardLoading ? 'Syncing…' : 'Refresh board'}
          </button>
        ) : null}
      </div>
      {message ? <p className="text-sm text-chalk">{message}</p> : null}
      <ul className={`${mysticCard} divide-y divide-line/80 overflow-hidden p-0`}>
        {sortedAppointments.length === 0 ? (
          <li className="list-none p-2">
            <MysticEmptyState variant="studio-ops" compact />
          </li>
        ) : (
          sortedAppointments.map((row) => {
            let serviceName = row.service_id.replace(/_/g, ' ');
            try {
              serviceName = getServiceById(row.service_id as ServiceId).name;
            } catch {
              /* keep id */
            }
            const isEnRoute = row.status === 'stylist_en_route';
            const live = isVisitLiveTracking(row.status);
            const rowBusy = busyId === row.id;
            const addressLine = formatAddressLine(row.address);
            const addressCoords = addressLatLng(row.address);
            const directionsUrl = addressCoords
              ? googleMapsDirectionsUrl(addressCoords)
              : addressLine
                ? googleMapsDirectionsUrl(addressLine)
                : null;
            return (
              <li
                key={row.id}
                className={`flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between ${
                  live ? 'bg-accent-soft/30' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{serviceName}</p>
                    <MysticVisitStatusBadge status={row.status} />
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <MysticUserAvatar
                      url={clientById[row.client_user_id]?.avatar_url}
                      name={clientLabel(row.client_user_id)}
                      size={28}
                    />
                    <p className="text-sm font-medium text-ink">
                      {clientLabel(row.client_user_id)}
                    </p>
                  </div>
                  <p className="text-sm text-muted">{formatVisitWhen(row.starts_at)}</p>
                  {addressLine ? <p className="mt-1 text-xs text-muted">{addressLine}</p> : null}
                  {row.tags?.length ? (
                    <p className="mt-1 text-xs text-chalk">
                      {formatAppointmentTagLabels(row.tags).join(' · ')}
                    </p>
                  ) : null}
                  {row.client_notes?.trim() ? (
                    <p className="mt-1 text-xs text-muted">
                      <span className="font-medium text-ink">Notes:</span> {row.client_notes.trim()}
                    </p>
                  ) : null}
                  {directionsUrl ? (
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs font-medium text-accent underline"
                    >
                      Directions in Google Maps
                    </a>
                  ) : null}
                  <Link
                    href={`/studio/messages?client=${row.client_user_id}`}
                    className="mt-2 inline-block text-xs font-medium text-accent underline"
                  >
                    Message client
                  </Link>
                  <MysticInspoGallery
                    photos={inspoByAppointment[row.id] ?? []}
                    label="Client inspo"
                  />
                </div>
                <div className="flex flex-wrap gap-2 md:max-w-md md:justify-end">
                  <button
                    type="button"
                    disabled={rowBusy}
                    onClick={() => void enRoute(row.id)}
                    className={`${mysticStudioBtn} disabled:opacity-50`}
                  >
                    {rowBusy && busyAction === 'enRoute' ? 'Sending…' : 'On the way'}
                  </button>
                  <button
                    type="button"
                    disabled={rowBusy || !isEnRoute}
                    title={isEnRoute ? undefined : 'Mark on the way first to share live map'}
                    onClick={() => void shareLive(row.id)}
                    className={`${mysticStudioBtnOutline} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {rowBusy && busyAction === 'shareLive' ? 'Updating…' : 'Update live map'}
                  </button>
                  <button
                    type="button"
                    disabled={rowBusy}
                    onClick={() => void doorTimer(row.id)}
                    className={`${mysticStudioBtnOutline} disabled:opacity-50`}
                  >
                    {rowBusy && busyAction === 'doorTimer' ? 'Starting…' : 'Door timer'}
                  </button>
                  <button
                    type="button"
                    disabled={rowBusy}
                    onClick={() => void completeVisit(row.id)}
                    className={`${mysticStudioBtnOutline} disabled:opacity-50`}
                  >
                    Complete
                  </button>
                  <button
                    type="button"
                    disabled={rowBusy}
                    onClick={() => void noShow(row.id)}
                    className="rounded-full border border-danger/40 px-4 py-2 text-xs text-danger disabled:opacity-50"
                  >
                    No-show
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
