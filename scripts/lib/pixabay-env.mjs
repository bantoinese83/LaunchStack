import { createWriteStream, existsSync, readFileSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
export const marketingDir = join(root, 'apps/web/public/marketing');
export const attributionPath = join(root, 'apps/web/src/lib/mystic/marketing-attribution.json');

export function loadPixabayKey() {
  if (process.env.PIXABAY_API_KEY) return process.env.PIXABAY_API_KEY;
  for (const envPath of [
    join(root, 'apps/web/.env.local'),
    join(root, '.env.local'),
  ]) {
    if (!existsSync(envPath)) continue;
    const text = readFileSync(envPath, 'utf8');
    for (const line of text.split('\n')) {
      const m = line.match(/^PIXABAY_API_KEY=(.+)$/);
      if (m) return m[1].trim().replace(/^["']|["']$/g, '');
    }
  }
  return null;
}

export async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status} ${url}`);
  await pipeline(res.body, createWriteStream(dest));
}

export async function searchPhotos(key, params) {
  const url = new URL('https://pixabay.com/api/');
  url.searchParams.set('key', key);
  url.searchParams.set('safesearch', 'true');
  url.searchParams.set('per_page', '20');
  url.searchParams.set('order', 'popular');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pixabay photos ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function searchVideos(key, params) {
  const url = new URL('https://pixabay.com/api/videos/');
  url.searchParams.set('key', key);
  url.searchParams.set('safesearch', 'true');
  url.searchParams.set('per_page', '20');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pixabay videos ${res.status}: ${await res.text()}`);
  return res.json();
}

/** Pick first hit not in usedIds, optionally skip same user as blocklist. */
export function pickUniqueHit(hits, usedIds, { minWidth = 1200, blockedUsers = [] } = {}) {
  for (const hit of hits ?? []) {
    if (usedIds.has(hit.id)) continue;
    if (blockedUsers.includes(hit.user)) continue;
    if (hit.imageWidth && hit.imageWidth < minWidth) continue;
    return hit;
  }
  for (const hit of hits ?? []) {
    if (!usedIds.has(hit.id)) return hit;
  }
  return hits?.[0];
}

export function pickUniqueVideo(hits, usedIds, { blockedUsers = [] } = {}) {
  for (const hit of hits ?? []) {
    if (usedIds.has(hit.id)) continue;
    if (blockedUsers.includes(hit.user)) continue;
    if (hit.videos?.medium?.url || hit.videos?.small?.url) return hit;
  }
  return hits?.find((h) => h.videos?.medium?.url || h.videos?.small?.url);
}
