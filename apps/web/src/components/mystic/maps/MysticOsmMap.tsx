'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { MYSTIC_RIVER_NORTH } from '@template/mystic';
import { mysticCard } from '@/components/mystic/mystic-styles';
import type { MysticMapShellProps } from './mystic-map-types';

const MysticOsmMapInner = dynamic(
  () => import('./MysticOsmMapInner').then((m) => m.MysticOsmMapInner),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-paper" /> }
);

export function MysticOsmMap({
  markers,
  heightClassName = 'h-56',
  defaultCenter,
  defaultZoom = 12,
  showRiverNorth = false,
  footer,
  header,
}: MysticMapShellProps) {
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
        <MysticOsmMapInner markers={allMarkers} center={center} zoom={defaultZoom} />
      </div>
      {footer ? <div className="border-t border-line">{footer}</div> : null}
      <p className="border-t border-line/60 px-3 py-1.5 text-[10px] text-muted">
        OpenStreetMap · switch to Google when billing is enabled (
        <code className="text-[10px]">NEXT_PUBLIC_MYSTIC_MAPS_PROVIDER=auto</code>)
      </p>
    </div>
  );
}
