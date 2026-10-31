'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  canUploadVisitInspo,
  DEFAULT_SURCHARGE_RULES,
  formatUsd,
  formatVisitWhen,
  getServiceById,
  isVisitLiveTracking,
  sortVisitsForDisplay,
  visitStatusLabel,
  type ServiceId,
} from '@template/mystic';
import { MysticDoorTimerBanner } from '@/components/mystic/MysticDoorTimerBanner';
import { MysticLiveMapEmbed } from '@/components/mystic/MysticLiveMapEmbed';
import { MysticPageIntro } from '@/components/mystic/MysticPageIntro';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticInspoGallery } from '@/components/mystic/MysticInspoGallery';
import { mysticCard, mysticInput } from '@/components/mystic/mystic-styles';

type Appointment = {
  id: string;
  service_id: string;
  starts_at: string;
  status: string;
  quote_cents: number;
  eta_minutes: number | null;
  door_timer_ends_at: string | null;
  stylist_latitude: number | null;
  stylist_longitude: number | null;
  stylist_location_updated_at: string | null;
  inspo_photos?: { id: string; public_url: string }[];
};

function InspoUpload({
  appointmentId,
  photoCount,
  onUploaded,
}: {
  appointmentId: string;
  photoCount: number;
  onUploaded: () => void;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatus(null);
    const form = new FormData();
    form.append('appointmentId', appointmentId);
    form.append('file', file);
    try {
      const res = await fetch('/api/mystic/appointments/inspo', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok) {
        setStatus('Photo saved — Luke will see it before your visit.');
        onUploaded();
      } else {
        setStatus(data.error ?? 'Upload failed');
      }
    } catch {
      setStatus('Upload failed — try again');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  if (photoCount >= DEFAULT_SURCHARGE_RULES.maxInspoPhotos) {
    return (
      <p className="mt-3 text-xs text-muted">
        Maximum {DEFAULT_SURCHARGE_RULES.maxInspoPhotos} inspo photos.
      </p>
    );
  }

  return (
    <label className="mt-3 block text-xs text-muted">
      {busy ? 'Uploading…' : 'Add inspo photo'}
      <input
        type="file"
        accept="image/*"
        disabled={busy}
        onChange={(ev) => void onFile(ev)}
        className={`${mysticInput} mt-1 text-xs disabled:opacity-50`}
      />
      {status ? <span className="mt-1 block text-chalk">{status}</span> : null}
    </label>
  );
}

export function VisitsClient() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback((opts?: { silent?: boolean }) => {
    if (!opts?.silent) setRefreshing(true);
    void fetch('/api/mystic/appointments/mine')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setError(null);
          setAppointments(data.appointments ?? []);
        }
      })
      .catch(() => setError('Sign in to see visits'))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = useMemo(() => sortVisitsForDisplay(appointments), [appointments]);
  const hasLiveTracking = useMemo(
    () => appointments.some((a) => isVisitLiveTracking(a.status)),
    [appointments]
  );

  useEffect(() => {
    if (!hasLiveTracking) return;
    const pollMs = 12_000;
    const id = setInterval(() => load({ silent: true }), pollMs);
    return () => clearInterval(id);
  }, [hasLiveTracking, load]);

  useEffect(() => {
    if (!hasLiveTracking) return;
    function onVisible() {
      if (document.visibilityState === 'visible') load({ silent: true });
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [hasLiveTracking, load]);

  return (
    <div className="mx-auto max-w-lg">
      <MysticPageIntro
        eyebrow="My visits"
        title="Your house calls"
        description="Live map when Luke is en route, inspo uploads, and messages."
      />
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted">
        {hasLiveTracking ? (
          <span className="text-chalk">Live updates while Luke is on the way</span>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => load()}
          disabled={refreshing}
          className="text-accent underline disabled:opacity-50"
        >
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      {error ? <p className="mt-4 text-sm text-muted">{error}</p> : null}
      {loading ? (
        <ul className="mt-8 space-y-4" aria-busy="true">
          {[0, 1].map((i) => (
            <li key={i} className={`${mysticCard} h-36 animate-pulse p-5`} />
          ))}
        </ul>
      ) : null}
      {!loading && sorted.length === 0 && !error ? (
        <MysticEmptyState
          variant="visits"
          className="mt-8"
          action={
            <MysticMagneticLink href="/book" fullWidth>
              Book a house call
            </MysticMagneticLink>
          }
        />
      ) : null}
      <ul className="mt-8 space-y-4">
        {sorted.map((row) => {
          let serviceName = row.service_id;
          try {
            serviceName = getServiceById(row.service_id as ServiceId).name;
          } catch {
            /* unknown service id */
          }
          const live = isVisitLiveTracking(row.status);
          return (
            <li key={row.id} className={`${mysticCard} p-5 ${live ? 'ring-2 ring-accent/40' : ''}`}>
              <p className="font-medium">{serviceName}</p>
              <p className="text-sm text-muted">{formatVisitWhen(row.starts_at)}</p>
              <p className="mt-2 text-sm text-chalk">
                {visitStatusLabel(row.status)}
                {row.eta_minutes && row.status === 'stylist_en_route'
                  ? ` · ~${row.eta_minutes} min`
                  : ''}
              </p>
              <p className="mt-1 text-sm">{formatUsd(row.quote_cents)}</p>
              {row.status === 'door_timer_active' && row.door_timer_ends_at ? (
                <MysticDoorTimerBanner endsAt={row.door_timer_ends_at} />
              ) : row.door_timer_ends_at ? (
                <p className="mt-2 text-xs text-muted">
                  Door timer ended at {new Date(row.door_timer_ends_at).toLocaleTimeString()}
                </p>
              ) : null}
              {row.status === 'stylist_en_route' &&
              row.stylist_latitude != null &&
              row.stylist_longitude != null ? (
                <MysticLiveMapEmbed
                  latitude={row.stylist_latitude}
                  longitude={row.stylist_longitude}
                  updatedAt={row.stylist_location_updated_at}
                />
              ) : row.status === 'stylist_en_route' ? (
                <p className="mt-3 rounded-xl border border-line bg-paper px-3 py-3 text-sm text-muted">
                  Luke is on the way — the map appears here as soon as location is shared. You can
                  still message him anytime.
                </p>
              ) : null}
              <MysticInspoGallery photos={row.inspo_photos ?? []} />
              {canUploadVisitInspo(row.status) ? (
                <InspoUpload
                  appointmentId={row.id}
                  photoCount={row.inspo_photos?.length ?? 0}
                  onUploaded={() => load({ silent: true })}
                />
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
