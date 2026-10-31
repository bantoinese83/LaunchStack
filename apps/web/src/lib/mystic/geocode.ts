import {
  distanceFromRiverNorthMiles,
  isWithinHouseCallServiceArea,
  houseCallDistanceOutOfAreaMessage,
  normalizeAddressFields,
  type AddressSuggestion,
} from '@template/mystic';
import { getGoogleMapsServerKey } from '@/lib/mystic/google-maps-server-key';
import { shouldUseGoogleGeocoding } from '@/lib/mystic/mystic-maps-config';

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  distanceMiles: number;
  formattedAddress?: string;
};

const NOMINATIM_HEADERS = { 'User-Agent': 'MysticHairCo/1.0 (house-call booking)' };

type NominatimAddress = {
  house_number?: string;
  road?: string;
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  hamlet?: string;
  county?: string;
  state?: string;
  postcode?: string;
  'ISO3166-2-lvl4'?: string;
};

type NominatimHit = {
  place_id: number;
  lat: string;
  lon: string;
  display_name?: string;
  address?: NominatimAddress;
};

function nominatimToSuggestion(hit: NominatimHit): AddressSuggestion {
  const a = hit.address ?? {};
  const streetParts = [a.house_number, a.road].filter(Boolean).join(' ');
  const line1 =
    streetParts ||
    hit.display_name?.split(',')[0]?.trim() ||
    hit.display_name?.slice(0, 80) ||
    'Address';
  const city = a.city ?? a.town ?? a.village ?? a.suburb ?? a.hamlet ?? a.county ?? '';
  let state = a['ISO3166-2-lvl4']?.replace(/^US-/, '') ?? '';
  if (!state || state.length > 2) {
    const fromName = a.state ?? '';
    state =
      fromName.length === 2
        ? fromName.toUpperCase()
        : normalizeAddressFields({ line1, city, state: fromName, postalCode: '' }).state;
  }
  const postalCode = (a.postcode ?? '').split('-')[0]?.trim() ?? '';
  return {
    id: String(hit.place_id),
    label: hit.display_name ?? line1,
    line1,
    city,
    state,
    postalCode,
    latitude: Number.parseFloat(hit.lat),
    longitude: Number.parseFloat(hit.lon),
  };
}

async function nominatimSearch(params: URLSearchParams): Promise<NominatimHit[]> {
  params.set('format', 'json');
  params.set('addressdetails', '1');
  params.set('countrycodes', 'us');
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: NOMINATIM_HEADERS,
  });
  if (!res.ok) return [];
  return (await res.json()) as NominatimHit[];
}

/** Typeahead for US addresses (Nominatim; Google Places when GOOGLE_MAPS_GEOCODING_KEY is set). */
export async function searchAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const googleKey = shouldUseGoogleGeocoding() ? getGoogleMapsServerKey() : null;
  if (googleKey) {
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.set('input', q);
    url.searchParams.set('key', googleKey);
    url.searchParams.set('components', 'country:us');
    url.searchParams.set('types', 'address');
    const res = await fetch(url.toString());
    const data = (await res.json()) as {
      predictions?: { place_id: string; description: string }[];
      status?: string;
    };
    if (data.status === 'OK' && data.predictions?.length) {
      const details = await Promise.all(
        data.predictions.slice(0, 5).map(async (p) => {
          const detailUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
          detailUrl.searchParams.set('place_id', p.place_id);
          detailUrl.searchParams.set('fields', 'address_components,geometry,formatted_address');
          detailUrl.searchParams.set('key', googleKey);
          const dRes = await fetch(detailUrl.toString());
          const dData = (await dRes.json()) as {
            result?: {
              formatted_address?: string;
              geometry?: { location: { lat: number; lng: number } };
              address_components?: { long_name: string; short_name: string; types: string[] }[];
            };
          };
          const r = dData.result;
          if (!r?.geometry) return null;
          const parts = r.address_components ?? [];
          const pick = (type: string, short = false) =>
            parts.find((c) => c.types.includes(type))?.[short ? 'short_name' : 'long_name'] ?? '';
          const streetNumber = pick('street_number');
          const route = pick('route');
          const line1 =
            [streetNumber, route].filter(Boolean).join(' ') || p.description.split(',')[0];
          return {
            id: p.place_id,
            label: r.formatted_address ?? p.description,
            line1,
            city: pick('locality') || pick('sublocality') || pick('neighborhood'),
            state: pick('administrative_area_level_1', true),
            postalCode: pick('postal_code'),
            latitude: r.geometry.location.lat,
            longitude: r.geometry.location.lng,
          } satisfies AddressSuggestion;
        })
      );
      return details.filter((d): d is AddressSuggestion => d !== null);
    }
  }

  const params = new URLSearchParams();
  params.set('q', `${q}, USA`);
  params.set('limit', '6');
  const hits = await nominatimSearch(params);
  return hits.map(nominatimToSuggestion);
}

/** Bias Nominatim toward Chicagoland (lon,lat order). */
const CHICAGO_VIEWBOX = '-88.05,41.62,-87.52,42.08';

function geocodeResultFromCoords(
  latitude: number,
  longitude: number,
  formattedAddress?: string
): GeocodeResult {
  const distanceMiles = distanceFromRiverNorthMiles(latitude, longitude);
  if (!isWithinHouseCallServiceArea(distanceMiles)) {
    throw new Error(houseCallDistanceOutOfAreaMessage(distanceMiles));
  }
  return {
    latitude,
    longitude,
    distanceMiles,
    formattedAddress,
  };
}

/** Geocode a house-call address (Google when keyed; otherwise OpenStreetMap Nominatim). */
export async function geocodeHouseCallAddress(input: {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
}): Promise<GeocodeResult> {
  const normalized = normalizeAddressFields(input);
  const googleKey = shouldUseGoogleGeocoding() ? getGoogleMapsServerKey() : null;
  if (googleKey) {
    const q = `${normalized.line1}, ${normalized.city}, ${normalized.state} ${normalized.postalCode}`;
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', q);
    url.searchParams.set('components', 'administrative_area:IL|country:US');
    url.searchParams.set('bounds', '41.62,-88.05|42.08,-87.52');
    url.searchParams.set('region', 'us');
    url.searchParams.set('key', googleKey);
    const res = await fetch(url.toString());
    const data = (await res.json()) as {
      results?: {
        geometry: { location: { lat: number; lng: number } };
        formatted_address?: string;
      }[];
    };
    const hit = data.results?.[0];
    if (hit) {
      const { lat, lng } = hit.geometry.location;
      return geocodeResultFromCoords(lat, lng, hit.formatted_address);
    }
  }

  const structured = new URLSearchParams();
  structured.set('street', normalized.line1);
  if (normalized.city) structured.set('city', normalized.city);
  if (normalized.state) structured.set('state', normalized.state);
  if (normalized.postalCode) structured.set('postalcode', normalized.postalCode);
  structured.set('country', 'USA');
  structured.set('limit', '1');
  structured.set('viewbox', CHICAGO_VIEWBOX);
  structured.set('bounded', '1');
  let hits = await nominatimSearch(structured);

  if (!hits.length) {
    const free = new URLSearchParams();
    free.set(
      'q',
      `${normalized.line1}, ${normalized.city}, ${normalized.state} ${normalized.postalCode}, USA`
    );
    free.set('limit', '1');
    free.set('viewbox', CHICAGO_VIEWBOX);
    free.set('bounded', '1');
    hits = await nominatimSearch(free);
  }

  const hit = hits[0];
  if (!hit) {
    throw new Error('Address not found — pick a suggestion or check street, city, state, and ZIP');
  }
  const latitude = Number.parseFloat(hit.lat);
  const longitude = Number.parseFloat(hit.lon);
  return geocodeResultFromCoords(latitude, longitude, hit.display_name);
}
