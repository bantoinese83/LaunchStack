/** Server-side Geocoding / Places (IP-restricted; never expose to client). */
export function getGoogleMapsServerKey(): string | undefined {
  const key =
    process.env.GOOGLE_MAPS_GEOCODING_KEY?.trim() ||
    process.env.GOOGLE_MAPS_SERVER_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  return key || undefined;
}
