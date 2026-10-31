/** River North, Chicago — house-call distance origin (discovery call). */
export const MYSTIC_RIVER_NORTH = {
  lat: 41.8925,
  lng: -87.634,
  label: 'River North',
} as const;

/** Max straight-line miles from River North for bookable house calls. */
export const MYSTIC_MAX_HOUSE_CALL_DISTANCE_MILES = 50;

export function houseCallDistanceOutOfAreaMessage(distanceMiles: number): string {
  const rounded = Math.round(distanceMiles * 10) / 10;
  return `That address is about ${rounded} mi from ${MYSTIC_RIVER_NORTH.label} — outside our Chicago house-call area. Pick a Chicago suggestion or message Luke if this looks wrong.`;
}

export function isWithinHouseCallServiceArea(distanceMiles: number): boolean {
  return (
    Number.isFinite(distanceMiles) &&
    distanceMiles >= 0 &&
    distanceMiles <= MYSTIC_MAX_HOUSE_CALL_DISTANCE_MILES
  );
}

const EARTH_RADIUS_MILES = 3958.8;

export function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_MILES * c * 10) / 10;
}

export function distanceFromRiverNorthMiles(lat: number, lng: number): number {
  return haversineMiles(MYSTIC_RIVER_NORTH.lat, MYSTIC_RIVER_NORTH.lng, lat, lng);
}

/** Google Maps pin for stylist live location. */
export function stylistLiveMapUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

/** Embedded map (OpenStreetMap) — no API key. */
export function openStreetMapEmbedUrl(
  latitude: number,
  longitude: number,
  deltaDegrees = 0.025
): string {
  const minLon = longitude - deltaDegrees;
  const maxLon = longitude + deltaDegrees;
  const minLat = latitude - deltaDegrees;
  const maxLat = latitude + deltaDegrees;
  const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${latitude},${longitude}`;
}

export type LatLng = { lat: number; lng: number };

/** OSM embed framing multiple pins (no API key / billing). */
export function openStreetMapEmbedForPoints(points: LatLng[], paddingDegrees = 0.03): string {
  if (!points.length) {
    return openStreetMapEmbedUrl(MYSTIC_RIVER_NORTH.lat, MYSTIC_RIVER_NORTH.lng);
  }
  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;
  for (const p of points) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  }
  minLat -= paddingDegrees;
  maxLat += paddingDegrees;
  minLng -= paddingDegrees;
  maxLng += paddingDegrees;
  const primary = points[0];
  const bbox = `${minLng},${minLat},${maxLng},${maxLat}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${primary.lat},${primary.lng}`;
}

export type MapCoordinate = { latitude: number; longitude: number; label?: string };

/** Read coordinates stored on appointment address JSON. */
export function addressLatLng(address: unknown): LatLng | null {
  if (!address || typeof address !== 'object') return null;
  const row = address as Record<string, unknown>;
  const latRaw = row.latitude ?? row.lat;
  const lngRaw = row.longitude ?? row.lng;
  const lat = typeof latRaw === 'number' ? latRaw : Number.parseFloat(String(latRaw ?? ''));
  const lng = typeof lngRaw === 'number' ? lngRaw : Number.parseFloat(String(lngRaw ?? ''));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

/** Turn-by-turn in Google Maps (Luke → client). */
export function googleMapsDirectionsUrl(
  destination: LatLng | string,
  origin?: LatLng | string
): string {
  const url = new URL('https://www.google.com/maps/dir/?api=1');
  url.searchParams.set('travelmode', 'driving');
  if (typeof destination === 'string') url.searchParams.set('destination', destination);
  else url.searchParams.set('destination', `${destination.lat},${destination.lng}`);
  if (origin) {
    if (typeof origin === 'string') url.searchParams.set('origin', origin);
    else url.searchParams.set('origin', `${origin.lat},${origin.lng}`);
  }
  return url.toString();
}

/** Static embed (Maps Embed API) when JS API is unavailable. */
export function googleMapsEmbedUrl(
  apiKey: string,
  latitude: number,
  longitude: number,
  zoom = 14
): string {
  const url = new URL('https://www.google.com/maps/embed/v1/view');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('center', `${latitude},${longitude}`);
  url.searchParams.set('zoom', String(zoom));
  return url.toString();
}

export function mapRegionFromCenter(
  latitude: number,
  longitude: number,
  latitudeDelta = 0.06,
  longitudeDelta = 0.06
) {
  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
}

/** Fit react-native-maps region to one or more pins. */
export function mapRegionForLatLngs(points: LatLng[], minDelta = 0.025) {
  if (points.length === 0) {
    return mapRegionFromCenter(MYSTIC_RIVER_NORTH.lat, MYSTIC_RIVER_NORTH.lng);
  }
  if (points.length === 1) {
    return mapRegionFromCenter(points[0]!.lat, points[0]!.lng, minDelta * 2, minDelta * 2);
  }
  let minLat = points[0]!.lat;
  let maxLat = points[0]!.lat;
  let minLng = points[0]!.lng;
  let maxLng = points[0]!.lng;
  for (const p of points) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  }
  const latitudeDelta = Math.max((maxLat - minLat) * 1.55, minDelta);
  const longitudeDelta = Math.max((maxLng - minLng) * 1.55, minDelta);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta,
    longitudeDelta,
  };
}

/** Resolve destination coords from a visit address blob. */
export function visitAddressDestination(address: unknown): LatLng | null {
  return addressLatLng(address);
}
