'use client';

import { useEffect, useMemo } from 'react';
import { AdvancedMarker, Map, useMap } from '@vis.gl/react-google-maps';
import { MYSTIC_RIVER_NORTH } from '@template/mystic';
import { getGoogleMapsMapId } from '@/lib/mystic/google-maps-config';
import { mysticCard } from '@/components/mystic/mystic-styles';
import { MYSTIC_GOOGLE_MAP_STYLE } from './mysticGoogleMapStyles';
import type { MysticMapMarker, MysticMapShellProps } from './mystic-map-types';
import { MysticMapCallout } from './MysticMapCallout';

const TONE_CLASS: Record<NonNullable<MysticMapMarker['tone']>, string> = {
  client: 'bg-surface text-ink ring-line',
  stylist: 'bg-accent text-paper ring-accent/40',
  hq: 'bg-gold-soft text-ink ring-gold/50',
};

function FitBounds({ markers }: { markers: MysticMapMarker[] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || markers.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    for (const m of markers) bounds.extend({ lat: m.lat, lng: m.lng });
    if (markers.length === 1) {
      map.setCenter({ lat: markers[0].lat, lng: markers[0].lng });
      map.setZoom(14);
      return;
    }
    map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
  }, [map, markers]);
  return null;
}

export function MysticGoogleMapInner({
  markers,
  heightClassName = 'h-56',
  defaultCenter,
  defaultZoom = 12,
  showRiverNorth = false,
  footer,
  header,
}: MysticMapShellProps) {
  const mapId = getGoogleMapsMapId();

  const allMarkers = useMemo(() => {
    const rows = [...markers];
    if (showRiverNorth) {
      rows.push({
        id: 'river-north',
        lat: MYSTIC_RIVER_NORTH.lat,
        lng: MYSTIC_RIVER_NORTH.lng,
        title: MYSTIC_RIVER_NORTH.label,
        subtitle: 'Mystic home base',
        tone: 'hq',
      });
    }
    return rows;
  }, [markers, showRiverNorth]);

  const center = useMemo(() => {
    if (defaultCenter) return defaultCenter;
    if (allMarkers[0]) return { lat: allMarkers[0].lat, lng: allMarkers[0].lng };
    return { lat: MYSTIC_RIVER_NORTH.lat, lng: MYSTIC_RIVER_NORTH.lng };
  }, [allMarkers, defaultCenter]);

  return (
    <div className={`${mysticCard} overflow-hidden p-0`}>
      {header ? <div className="border-b border-line px-3 py-2">{header}</div> : null}
      <div className={`relative w-full ${heightClassName}`}>
        <Map
          mapId={mapId}
          defaultCenter={center}
          defaultZoom={defaultZoom}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          styles={mapId === 'DEMO_MAP_ID' ? MYSTIC_GOOGLE_MAP_STYLE : undefined}
          style={{ width: '100%', height: '100%' }}
        >
          <FitBounds markers={allMarkers} />
          {allMarkers.map((m) => (
            <AdvancedMarker key={m.id} position={{ lat: m.lat, lng: m.lng }} title={m.title}>
              <div
                className={`rounded-xl bg-paper px-2 py-1.5 shadow-md ring-2 ${
                  TONE_CLASS[m.tone ?? 'client']
                }`}
              >
                <MysticMapCallout marker={m} compact />
              </div>
            </AdvancedMarker>
          ))}
        </Map>
      </div>
      {footer ? <div className="border-t border-line">{footer}</div> : null}
    </div>
  );
}
