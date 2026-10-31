import { getGoogleMapsBrowserKey } from '@/lib/mystic/google-maps-config';

/** `osm` = free OpenStreetMap (default until Google billing). `google` = Maps JS only. `auto` = try Google, fall back to OSM. */
export type MysticMapsProvider = 'osm' | 'google' | 'auto';

export function getMysticMapsProvider(): MysticMapsProvider {
  const raw = process.env.NEXT_PUBLIC_MYSTIC_MAPS_PROVIDER?.trim().toLowerCase();
  if (raw === 'google' || raw === 'osm' || raw === 'auto') return raw;
  return 'osm';
}

export function shouldUseGoogleMapsClient(): boolean {
  const mode = getMysticMapsProvider();
  if (mode === 'osm') return false;
  if (mode === 'google') return Boolean(getGoogleMapsBrowserKey());
  return Boolean(getGoogleMapsBrowserKey());
}

/** Server geocoding — skip Google when on OSM-only mode (avoids billing / REQUEST_DENIED noise). */
export function shouldUseGoogleGeocoding(): boolean {
  const mode = getMysticMapsProvider();
  if (mode === 'osm') return false;
  return Boolean(
    process.env.GOOGLE_MAPS_GEOCODING_KEY?.trim() ||
    process.env.GOOGLE_MAPS_SERVER_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim()
  );
}
