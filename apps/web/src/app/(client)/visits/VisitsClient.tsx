'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  canUploadVisitInspo,
  DEFAULT_SURCHARGE_RULES,
  formatAddressLine,
  formatUsd,
  formatVisitWhen,
  getServiceById,
  isVisitLiveTracking,
  partitionVisitsForTabs,
  pickUpNextVisit,
  visitStatusLabel,
  visitsTabEmptyContent,
  type ServiceId,
} from '@template/mystic';
import { MysticVisitStatusBadge } from '@/components/mystic/MysticVisitStatusBadge';
import { MysticDoorTimerBanner } from '@/components/mystic/MysticDoorTimerBanner';
import {
  MysticLiveMapEmbed,
  visitAddressDestination,
} from '@/components/mystic/MysticLiveMapEmbed';
import { MysticSalonLoader } from '@/components/mystic/MysticSalonLoader';
import { MysticPageIntro } from '@/components/mystic/MysticPageIntro';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { MysticMagneticButton, MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticInspoGallery } from '@/components/mystic/MysticInspoGallery';
import { MysticClientPage } from '@/components/mystic/MysticClientPage';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';
import { MysticVisitUpNext } from '@/components/mystic/MysticVisitUpNext';
import { MysticServiceIllustration } from '@/components/mystic/illustrations/MysticServiceIllustration';
import { MysticStylistChip } from '@/components/mystic/MysticStylistChip';
import {
  mysticInput,
  mysticLiveHighlight,
  mysticSegmentShell,
  mysticSegmentTab,
  mysticToolbarRow,
} from '@/components/mystic/mystic-styles';

type VisitTab = 'upcoming' | 'past';

type Appointment = {
  id: string;
  service_id: string;
  starts_at: string;
  status: string;
  address?: Record<string, unknown>;
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
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<VisitTab>('upcoming');
  const [releasingHold, setReleasingHold] = useState(false);

  const load = useCallback(
    (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setRefreshing(true);
      void fetch('/api/mystic/appointments/mine')
        .then(async (r) => {
          const data = await r.json();
          if (r.status === 401) {
            router.push('/login?next=/visits');
            return;
          }
          if (!r.ok || data.error) {
            setError(data.error ?? 'Could not load visits');
            return;
          }
          setError(null);
          setAppointments(data.appointments ?? []);
        })
        .catch(() => setError('Sign in to see visits'))
        .finally(() => {
          setLoading(false);
          setRefreshing(false);
        });
    },
    [router]
  );

  async function releasePendingHold() {
    setReleasingHold(true);
    setError(null);
    try {
      const res = await fetch('/api/mystic/appointments/release-checkout', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data.error ?? 'Could not release hold — message Luke if the slot still looks taken.'
        );
        return;
      }
      load({ silent: true });
      router.push('/book');
    } catch {
      setError('Could not release hold — check your connection and try again.');
    } finally {
      setReleasingHold(false);
    }
  }

  useDeferredEffect(() => load(), [load]);

  const { upcoming, past } = useMemo(() => partitionVisitsForTabs(appointments), [appointments]);
  const visibleRows = tab === 'upcoming' ? upcoming : past;
  const upNext = useMemo(
    () => (tab === 'upcoming' ? pickUpNextVisit(upcoming) : null),
    [tab, upcoming]
  );
  const listRows = useMemo(() => {
    if (!upNext || tab !== 'upcoming') return visibleRows;
    return visibleRows.filter((row) => row.id !== upNext.id);
  }, [tab, upNext, visibleRows]);
  const hasLiveTracking = useMemo(
    () => appointments.some((a) => isVisitLiveTracking(a.status)),
    [appointments]
  );
  const hasPending = useMemo(
    () => appointments.some((a) => a.status === 'pending'),
    [appointments]
  );

  useEffect(() => {
    if (!hasLiveTracking && !hasPending) return;
    const pollMs = hasLiveTracking ? 12_000 : 45_000;
    const id = setInterval(() => load({ silent: true }), pollMs);
    return () => clearInterval(id);
  }, [hasLiveTracking, hasPending, load]);

  useEffect(() => {
    if (!hasLiveTracking) return;
    function onVisible() {
      if (document.visibilityState === 'visible') load({ silent: true });
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [hasLiveTracking, load]);

  const tabEmpty = visitsTabEmptyContent(tab);
  const showGlobalEmpty = !loading && appointments.length === 0 && !error;
  const showTabEmpty = !loading && appointments.length > 0 && visibleRows.length === 0 && !error;

  return (
    <MysticClientPage>
      <MysticPageIntro eyebrow="My visits" title="Your house calls" />
      <div className={mysticSegmentShell} role="tablist" aria-label="Visit timeframe">
        {(
          [
            ['upcoming', `Upcoming (${upcoming.length})`],
            ['past', `Past (${past.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={mysticSegmentTab(tab === key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={`${mysticToolbarRow} text-xs text-muted`}>
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
      {error ? <p className="text-sm text-muted">{error}</p> : null}
      {loading ? <MysticSalonLoader copyKey="visits" className="py-10" /> : null}
      {showGlobalEmpty ? (
        <MysticEmptyState
          variant="visits"
          action={
            <MysticMagneticLink href="/book" fullWidth>
              Book a house call
            </MysticMagneticLink>
          }
        />
      ) : null}
      {showTabEmpty ? (
        <MysticEmptyState
          variant="visits"
          compact
          eyebrow={tabEmpty.eyebrow}
          title={tabEmpty.title}
          description={tabEmpty.description}
          action={
            tab === 'upcoming' ? (
              <MysticMagneticLink href="/book" fullWidth>
                Book a house call
              </MysticMagneticLink>
            ) : undefined
          }
        />
      ) : null}
      {tab === 'upcoming' && upNext ? <MysticVisitUpNext visit={upNext} /> : null}
      {tab === 'upcoming' && listRows.length > 0 ? (
        <h2 className="type-eyebrow text-muted">All upcoming</h2>
      ) : null}
      <ul className="flex flex-col gap-3">
        {listRows.map((row) => {
          let serviceName = row.service_id;
          try {
            serviceName = getServiceById(row.service_id as ServiceId).name;
          } catch {
            /* unknown service id */
          }
          const live = isVisitLiveTracking(row.status);
          const addressLine = formatAddressLine(row.address);
          return (
            <li
              key={row.id}
              id={row.id}
              className={`rounded-2xl bg-surface p-4 ${live ? mysticLiveHighlight : ''}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <MysticServiceIllustration serviceId={row.service_id as ServiceId} size="sm" />
                  <p className="font-medium">{serviceName}</p>
                </div>
                <MysticVisitStatusBadge status={row.status} />
              </div>
              <p className="mt-2 text-sm text-muted">{formatVisitWhen(row.starts_at)}</p>
              {tab === 'upcoming' ? <MysticStylistChip className="mt-2" size={32} /> : null}
              {addressLine ? <p className="mt-1 text-xs text-muted">{addressLine}</p> : null}
              <p className="mt-2 text-sm text-chalk">
                {visitStatusLabel(row.status)}
                {row.eta_minutes && row.status === 'stylist_en_route'
                  ? ` · ~${row.eta_minutes} min`
                  : ''}
              </p>
              {row.status === 'pending' ? (
                <div className="mt-2 space-y-2 rounded-xl border border-line bg-paper px-3 py-3">
                  <p className="text-xs text-muted">
                    Checkout wasn&apos;t finished — unpaid holds auto-cancel after about 90 minutes.
                    Finish payment from booking, or release this slot and choose a new time.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <MysticMagneticLink href="/book" size="sm">
                      Back to booking
                    </MysticMagneticLink>
                    <MysticMagneticButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={releasingHold}
                      onClick={() => void releasePendingHold()}
                    >
                      {releasingHold ? 'Releasing…' : 'Release slot & book again'}
                    </MysticMagneticButton>
                  </div>
                </div>
              ) : null}
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
                  destination={visitAddressDestination(row.address)}
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
              <MysticMagneticLink href="/messages" variant="secondary" size="sm" className="mt-4">
                Message Luke about this visit
              </MysticMagneticLink>
            </li>
          );
        })}
      </ul>
    </MysticClientPage>
  );
}
