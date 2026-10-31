import { distanceFromRiverNorthMiles } from '@template/mystic';

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  distanceMiles: number;
  formattedAddress?: string;
};

/** Geocode a Chicago house-call address (Nominatim). Set GOOGLE_MAPS_GEOCODING_KEY for Google fallback. */
export async function geocodeHouseCallAddress(input: {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
}): Promise<GeocodeResult> {
  const googleKey = process.env.GOOGLE_MAPS_GEOCODING_KEY;
  if (googleKey) {
    const q = `${input.line1}, ${input.city}, ${input.state} ${input.postalCode}`;
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', q);
    url.searchParams.set('key', googleKey);
    const res = await fetch(url.toString());
    const data = (await res.json()) as {
      results?: {
        geometry: { location: { lat: number; lng: number } };
        formatted_address?: string;
      }[];
      status?: string;
    };
    const hit = data.results?.[0];
    if (hit) {
      const { lat, lng } = hit.geometry.location;
      return {
        latitude: lat,
        longitude: lng,
        distanceMiles: distanceFromRiverNorthMiles(lat, lng),
        formattedAddress: hit.formatted_address,
      };
    }
  }

  const query = encodeURIComponent(
    `${input.line1}, ${input.city}, ${input.state} ${input.postalCode}, USA`
  );
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
    {
      headers: { 'User-Agent': 'MysticHairCo/1.0 (house-call booking)' },
    }
  );
  if (!res.ok) {
    throw new Error('Could not geocode address');
  }
  const data = (await res.json()) as { lat: string; lon: string; display_name?: string }[];
  const hit = data[0];
  if (!hit) {
    throw new Error('Address not found — check street and ZIP');
  }
  const latitude = Number.parseFloat(hit.lat);
  const longitude = Number.parseFloat(hit.lon);
  return {
    latitude,
    longitude,
    distanceMiles: distanceFromRiverNorthMiles(latitude, longitude),
    formattedAddress: hit.display_name,
  };
}
