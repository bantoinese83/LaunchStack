'use client';

import { useEffect, useState } from 'react';
import {
  formatRelativeUpdatedAt,
  isLocationUpdateFresh,
  openStreetMapEmbedUrl,
  stylistLiveMapUrl,
} from '@template/mystic';

type Props = {
  latitude: number;
  longitude: number;
  updatedAt?: string | null;
  title?: string;
};

export function MysticLiveMapEmbed({ latitude, longitude, updatedAt, title = 'Luke' }: Props) {
  const embedSrc = openStreetMapEmbedUrl(latitude, longitude);
  const external = stylistLiveMapUrl(latitude, longitude);
  const [now, setNow] = useState(() => Date.now());
  const fresh = isLocationUpdateFresh(updatedAt);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-paper">
      <div className="flex items-center justify-between border-b border-line px-3 py-2 text-xs text-muted">
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
      <iframe
        title={`${title} live location`}
        src={embedSrc}
        className="h-52 w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        href={external}
        target="_blank"
        rel="noreferrer"
        className="block border-t border-line px-3 py-2 text-center text-xs text-accent underline"
      >
        Open in Google Maps
      </a>
    </div>
  );
}
