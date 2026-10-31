/** River North, Chicago — house-call distance origin (discovery call). */
export const MYSTIC_RIVER_NORTH = {
  lat: 41.8925,
  lng: -87.634,
  label: 'River North',
} as const;

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

export type MapCoordinate = { latitude: number; longitude: number; label?: string };

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
