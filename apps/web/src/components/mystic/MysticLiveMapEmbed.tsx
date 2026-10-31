'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  addressLatLng,
  formatRelativeUpdatedAt,
  isLocationUpdateFresh,
  stylistLiveMapUrl,
  type LatLng,
} from '@template/mystic';
import { MysticMap, type MysticMapMarker } from '@/components/mystic/maps/MysticMap';

type Props = {
  latitude: number;
  longitude: number;
  updatedAt?: string | null;
  title?: string;
  /** Client house-call pin when en route. */
  destination?: LatLng | null;
};

export function MysticLiveMapEmbed({
  latitude,
  longitude,
  updatedAt,
  title = 'Luke',
  destination,
}: Props) {
  const external = stylistLiveMapUrl(latitude, longitude);
  const [now, setNow] = useState(() => Date.now());
  const fresh = isLocationUpdateFresh(updatedAt);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  const header = (
    <div className="flex items-center justify-between text-xs text-muted">
      <span className="flex items-center gap-2">
        {fresh ? (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
        ) : null}
        <span>{title} · live on map</span>
      </span>
      {updatedAt ? (
        <span>{formatRelativeUpdatedAt(updatedAt, now)}</span>
      ) : (
        <span>Location shared</span>
      )}
    </div>
  );

  const footer = (
    <a
      href={external}
      target="_blank"
      rel="noreferrer"
      className="block px-3 py-2 text-center text-xs text-accent underline"
    >
      Open in Google Maps
    </a>
  );

  const markers = useMemo((): MysticMapMarker[] => {
    const rows: MysticMapMarker[] = [
      {
        id: 'stylist',
        lat: latitude,
        lng: longitude,
        title,
        subtitle: fresh ? 'Live' : 'Last known',
        tone: 'stylist',
      },
    ];
    if (destination) {
      rows.push({
        id: 'client',
        lat: destination.lat,
        lng: destination.lng,
        title: 'Your visit',
        subtitle: 'House call',
        tone: 'client',
      });
    }
    return rows;
  }, [destination, fresh, latitude, longitude, title]);

  return (
    <div className="mt-4">
      <MysticMap markers={markers} heightClassName="h-52" header={header} footer={footer} />
    </div>
  );
}

/** Resolve destination coords from a visit address blob. */
export function visitAddressDestination(address: unknown): LatLng | null {
  return addressLatLng(address);
}
