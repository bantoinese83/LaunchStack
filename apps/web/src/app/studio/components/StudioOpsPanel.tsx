'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  formatVisitWhen,
  getServiceById,
  visitStatusLabel,
  type ServiceId,
} from '@template/mystic';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { MysticInspoGallery, type InspoPhoto } from '@/components/mystic/MysticInspoGallery';
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

export function StudioOpsPanel({ initialAppointments }: { initialAppointments: Appointment[] }) {
  const workspaceId = getMysticWorkspaceId();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [eta, setEta] = useState(20);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [inspoByAppointment, setInspoByAppointment] = useState<Record<string, InspoPhoto[]>>({});

  const appointmentIds = useMemo(() => appointments.map((a) => a.id).join(','), [appointments]);

  useEffect(() => {
    if (!appointmentIds) {
      setInspoByAppointment({});
      return;
    }
    const ids = appointmentIds.split(',');
    void Promise.all(
      ids.map(async (id) => {
        const res = await fetch(`/api/mystic/appointments/inspo?appointmentId=${id}`);
        const data = await res.json();
        return { id, photos: (data.photos ?? []) as InspoPhoto[] };
      })
    ).then((rows) => {
      const next: Record<string, InspoPhoto[]> = {};
      for (const row of rows) next[row.id] = row.photos;
      setInspoByAppointment(next);
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

  if (!workspaceId) {
    return (
      <p className={`${mysticCard} p-4 text-sm text-muted`}>
        Set <code className="text-ink">NEXT_PUBLIC_MYSTIC_WORKSPACE_ID</code> after your Mystic
        workspace is created in Supabase.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {message ? <p className="text-sm text-chalk">{message}</p> : null}
      <label className="flex items-center gap-2 text-sm">
        ETA (minutes)
        <input
          type="number"
          value={eta}
          onChange={(e) => setEta(Number(e.target.value))}
          className={`${mysticInput} w-20 px-2 py-1`}
        />
      </label>
      <ul className={`${mysticCard} divide-y divide-line/80 overflow-hidden p-0`}>
        {appointments.length === 0 ? (
          <li className="list-none p-2">
            <MysticEmptyState variant="studio-ops" compact />
          </li>
        ) : (
          appointments.map((row) => {
            let serviceName = row.service_id.replace(/_/g, ' ');
            try {
              serviceName = getServiceById(row.service_id as ServiceId).name;
            } catch {
              /* keep id */
            }
            const isEnRoute = row.status === 'stylist_en_route';
            const rowBusy = busyId === row.id;
            return (
              <li
                key={row.id}
                className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{serviceName}</p>
                  <p className="text-sm text-muted">
                    {formatVisitWhen(row.starts_at)} · {visitStatusLabel(row.status)}
                  </p>
                  <MysticInspoGallery
                    photos={inspoByAppointment[row.id] ?? []}
                    label="Client inspo"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
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
