'use client';

import { useMemo, useState } from 'react';
import {
  addressLatLng,
  formatAddressLine,
  formatVisitWhen,
  getServiceById,
  googleMapsDirectionsUrl,
  isVisitLiveTracking,
  type ServiceId,
} from '@template/mystic';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';
import { MysticMap, type MysticMapMarker } from '@/components/mystic/maps/MysticMap';

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

type ClientRow = {
  user_id: string;
  full_name: string | null;
  avatar_url?: string | null;
};

export function StudioTodayMap({
  appointments,
  clientsById,
}: {
  appointments: Appointment[];
  clientsById: Record<string, ClientRow>;
}) {
  const workspaceId = getMysticWorkspaceId();
  const [geocoded, setGeocoded] = useState<Record<string, { lat: number; lng: number }>>({});
  const [loading, setLoading] = useState(false);

  const active = useMemo(
    () => appointments.filter((a) => !['canceled', 'no_show', 'completed'].includes(a.status)),
    [appointments]
  );

  useDeferredEffect(() => {
    if (!workspaceId || active.length === 0) {
      setGeocoded({});
      return;
    }
    const missing = active.filter((a) => !addressLatLng(a.address));
    if (missing.length === 0) {
      setGeocoded({});
      return;
    }
    setLoading(true);
    void fetch('/api/mystic/geocode/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId,
        stops: missing.map((a) => ({
          id: a.id,
          address: a.address ?? {},
          label: formatAddressLine(a.address) ?? undefined,
        })),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const next: Record<string, { lat: number; lng: number }> = {};
        for (const m of (data.markers ?? []) as { id: string; lat: number; lng: number }[]) {
          next[m.id] = { lat: m.lat, lng: m.lng };
        }
        setGeocoded(next);
      })
      .finally(() => setLoading(false));
  }, [active, workspaceId]);

  const markers = useMemo(() => {
    const rows: MysticMapMarker[] = [];
    for (const appt of active) {
      const coords = addressLatLng(appt.address) ?? geocoded[appt.id];
      if (!coords) continue;
      let serviceName = appt.service_id;
      try {
        serviceName = getServiceById(appt.service_id as ServiceId).name;
      } catch {
        /* keep id */
      }
      const client = clientsById[appt.client_user_id];
      const live = isVisitLiveTracking(appt.status);
      rows.push({
        id: `client-${appt.id}`,
        lat: coords.lat,
        lng: coords.lng,
        title: client?.full_name?.split(' ')[0] ?? 'Client',
        subtitle: `${serviceName} · ${formatVisitWhen(appt.starts_at)}`,
        tone: live ? 'stylist' : 'client',
        avatarUrl: client?.avatar_url ?? null,
        avatarName: client?.full_name ?? 'Client',
      });
      if (
        appt.status === 'stylist_en_route' &&
        appt.stylist_latitude != null &&
        appt.stylist_longitude != null
      ) {
        rows.push({
          id: `luke-${appt.id}`,
          lat: appt.stylist_latitude,
          lng: appt.stylist_longitude,
          title: 'Luke',
          subtitle: 'Live · en route',
          tone: 'stylist',
        });
      }
    }
    return rows;
  }, [active, clientsById, geocoded]);

  if (active.length === 0) return null;

  const firstStop = markers.find((m) => m.id.startsWith('client-'));

  return (
    <section aria-labelledby="studio-today-map-heading" className="space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="studio-today-map-heading" className="type-eyebrow text-muted">
            Today on the map
          </h2>
          <p className="text-sm text-muted">
            House calls in Chicago · {loading ? 'Updating pins…' : `${markers.length} pins`}
          </p>
        </div>
        {firstStop ? (
          <a
            href={googleMapsDirectionsUrl({ lat: firstStop.lat, lng: firstStop.lng })}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-accent underline"
          >
            Directions to next stop
          </a>
        ) : null}
      </div>
      <MysticMap
        markers={markers}
        heightClassName="h-72 md:h-80"
        showRiverNorth
        header={
          <p className="text-xs text-muted">
            Sage pins = client addresses · Gold = Luke live or active visit
          </p>
        }
      />
    </section>
  );
}
