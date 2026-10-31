'use client';

import { useState } from 'react';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
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

export function StudioOpsPanel({ initialAppointments }: { initialAppointments: Appointment[] }) {
  const workspaceId = getMysticWorkspaceId();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [eta, setEta] = useState(20);
  const [message, setMessage] = useState<string | null>(null);

  async function enRoute(appointmentId: string) {
    const res = await fetch('/api/mystic/appointments/en-route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId, etaMinutes: eta }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? 'Failed');
      return;
    }
    setAppointments((rows) =>
      rows.map((row) => (row.id === appointmentId ? { ...row, status: 'stylist_en_route' } : row))
    );
    setMessage('Client notified — on the way');
  }

  async function completeVisit(appointmentId: string) {
    const res = await fetch('/api/mystic/appointments/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId }),
    });
    const data = await res.json();
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
    const res = await fetch('/api/mystic/appointments/no-show', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? 'Failed');
      return;
    }
    setMessage('Marked no-show — deposit capture attempted');
  }

  async function doorTimer(appointmentId: string) {
    const res = await fetch('/api/mystic/appointments/door-timer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? 'Failed');
      return;
    }
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
          <li className="p-6 text-sm text-muted">
            No appointments loaded — apply migrations & book.
          </li>
        ) : (
          appointments.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium capitalize">{row.service_id.replace('_', ' ')}</p>
                <p className="text-sm text-muted">
                  {new Date(row.starts_at).toLocaleString()} · {row.status.replace(/_/g, ' ')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => enRoute(row.id)} className={mysticStudioBtn}>
                  On the way
                </button>
                <button
                  type="button"
                  onClick={() => doorTimer(row.id)}
                  className={mysticStudioBtnOutline}
                >
                  Door timer
                </button>
                <button
                  type="button"
                  onClick={() => completeVisit(row.id)}
                  className={mysticStudioBtnOutline}
                >
                  Complete
                </button>
                <button
                  type="button"
                  onClick={() => noShow(row.id)}
                  className="rounded-full border border-danger/40 px-4 py-2 text-xs text-danger"
                >
                  No-show
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
