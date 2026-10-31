'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatUsd, getServiceById, type ServiceId } from '@template/mystic';
import { MysticPageIntro } from '@/components/mystic/MysticPageIntro';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { mysticCard, mysticInput } from '@/components/mystic/mystic-styles';

type Appointment = {
  id: string;
  service_id: string;
  starts_at: string;
  status: string;
  quote_cents: number;
  eta_minutes: number | null;
  door_timer_ends_at: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  stylist_en_route: 'Luke is on the way',
  door_timer_active: 'Door timer — please answer',
  confirmed: 'Confirmed',
  completed: 'Completed',
};

function InspoUpload({ appointmentId }: { appointmentId: string }) {
  const [status, setStatus] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('appointmentId', appointmentId);
    form.append('file', file);
    const res = await fetch('/api/mystic/appointments/inspo', { method: 'POST', body: form });
    const data = await res.json();
    setStatus(res.ok ? 'Uploaded' : (data.error ?? 'Upload failed'));
  }

  return (
    <label className="mt-3 block text-xs text-muted">
      Add inspo photo
      <input
        type="file"
        accept="image/*"
        onChange={onFile}
        className={`${mysticInput} mt-1 text-xs`}
      />
      {status ? <span className="text-chalk">{status}</span> : null}
    </label>
  );
}

export function VisitsClient() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch('/api/mystic/appointments/mine')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setAppointments(data.appointments ?? []);
      })
      .catch(() => setError('Sign in to see visits'));
  }, []);

  return (
    <div className="mx-auto max-w-lg">
      <MysticPageIntro
        eyebrow="My visits"
        title="Your house calls"
        description="Status, inspo uploads, and links to message Luke."
      />
      {error ? <p className="mt-4 text-sm text-muted">{error}</p> : null}
      <ul className="mt-8 space-y-4">
        {appointments.map((row) => {
          let serviceName = row.service_id;
          try {
            serviceName = getServiceById(row.service_id as ServiceId).name;
          } catch {
            /* unknown service id */
          }
          return (
            <li key={row.id} className={`${mysticCard} p-5`}>
              <p className="font-medium">{serviceName}</p>
              <p className="text-sm text-muted">{new Date(row.starts_at).toLocaleString()}</p>
              <p className="mt-2 text-sm text-chalk">
                {STATUS_LABEL[row.status] ?? row.status.replace(/_/g, ' ')}
                {row.eta_minutes ? ` · ~${row.eta_minutes} min` : ''}
              </p>
              <p className="mt-1 text-sm">{formatUsd(row.quote_cents)}</p>
              {row.door_timer_ends_at ? (
                <p className="mt-2 text-xs text-danger">
                  Timer until {new Date(row.door_timer_ends_at).toLocaleTimeString()}
                </p>
              ) : null}
              {row.status !== 'canceled' && row.status !== 'no_show' ? (
                <InspoUpload appointmentId={row.id} />
              ) : null}
            </li>
          );
        })}
      </ul>
      <MysticMagneticLink href="/messages" className="mt-8">
        Message Luke
      </MysticMagneticLink>
    </div>
  );
}
