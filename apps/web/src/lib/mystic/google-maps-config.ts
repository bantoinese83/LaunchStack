/** Browser Maps JavaScript / Embed API key (referrer-restricted). */
export function getGoogleMapsBrowserKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  return key || undefined;
}

/** Cloud map style ID (Map Management → Map IDs). Falls back to Google demo map. */
export function getGoogleMapsMapId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || 'DEMO_MAP_ID';
}

export function hasGoogleMapsBrowserKey(): boolean {
  return Boolean(getGoogleMapsBrowserKey());
}
