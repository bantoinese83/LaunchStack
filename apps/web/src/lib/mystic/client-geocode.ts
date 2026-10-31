export type AddressInput = {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  notes?: string;
};

export async function fetchGeocodedDistance(address: AddressInput) {
  const res = await fetch('/api/mystic/geocode/distance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(address),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? 'Could not calculate distance');
  }
  return data as {
    distanceMiles: number;
    latitude: number;
    longitude: number;
    formattedAddress?: string;
  };
}
