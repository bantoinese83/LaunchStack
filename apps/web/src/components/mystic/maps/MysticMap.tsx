'use client';

import { getMysticMapsProvider, shouldUseGoogleMapsClient } from '@/lib/mystic/mystic-maps-config';
import { MysticGoogleMapWithOsmFallback } from './MysticGoogleMapAuto';
import { MysticGoogleMapInner } from './MysticGoogleMapInner';
import { MysticOsmMap } from './MysticOsmMap';
import type { MysticMapMarker, MysticMapShellProps } from './mystic-map-types';

export type { MysticMapMarker };

/** Interactive map — OSM by default; Google when provider is google/auto and billing works. */
export function MysticMap(props: MysticMapShellProps) {
  const mode = getMysticMapsProvider();
  if (mode === 'osm' || !shouldUseGoogleMapsClient()) {
    return <MysticOsmMap {...props} />;
  }
  if (mode === 'auto') {
    return <MysticGoogleMapWithOsmFallback {...props} />;
  }
  return <MysticGoogleMapInner {...props} />;
}

/** @deprecated Use MysticMap */
export const MysticGoogleMap = MysticMap;
