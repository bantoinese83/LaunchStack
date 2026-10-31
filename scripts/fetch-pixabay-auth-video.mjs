#!/usr/bin/env node
/**
 * Downloads a Pixabay background video for auth pages → public/marketing/auth-bg.mp4
 * Requires PIXABAY_API_KEY (same as fetch-pixabay-marketing.mjs).
 *
 * Usage: node scripts/fetch-pixabay-auth-video.mjs
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createWriteStream, existsSync, readFileSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'apps/web/public/marketing');
const attributionPath = join(root, 'apps/web/src/lib/mystic/marketing-attribution.json');
const publicAttributionPath = join(outDir, 'attribution.json');

function loadKey() {
  if (process.env.PIXABAY_API_KEY) return process.env.PIXABAY_API_KEY;
  const envLocal = join(root, 'apps/web/.env.local');
  if (!existsSync(envLocal)) return null;
  const text = readFileSync(envLocal, 'utf8');
  for (const line of text.split('\n')) {
    const m = line.match(/^PIXABAY_API_KEY=(.+)$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status} ${url}`);
  await pipeline(res.body, createWriteStream(dest));
}

async function main() {
  const key = loadKey();
  if (!key) {
    console.error('Set PIXABAY_API_KEY in env or apps/web/.env.local');
    process.exit(1);
  }

  const url = new URL('https://pixabay.com/api/videos/');
  url.searchParams.set('key', key);
  url.searchParams.set('q', 'hair salon woman styling');
  url.searchParams.set('video_type', 'film');
  url.searchParams.set('per_page', '8');
  url.searchParams.set('safesearch', 'true');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pixabay videos ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const hit = data.hits?.[0];
  if (!hit) {
    console.error('No Pixabay video hits for auth background');
    process.exit(1);
  }

  const videoUrl =
    hit.videos?.medium?.url ||
    hit.videos?.small?.url ||
    hit.videos?.large?.url ||
    hit.videos?.tiny?.url;
  if (!videoUrl) {
    console.error('No video URL on hit', hit.id);
    process.exit(1);
  }

  await mkdir(outDir, { recursive: true });
  const dest = join(outDir, 'auth-bg.mp4');
  console.log(`Downloading auth background → auth-bg.mp4 (${hit.pageURL})`);
  await download(videoUrl, dest);

  let payload = { source: 'Pixabay', license: 'Pixabay Content License', items: [] };
  if (existsSync(attributionPath)) {
    payload = JSON.parse(await readFile(attributionPath, 'utf8'));
  }
  const items = (payload.items ?? []).filter((i) => i.role !== 'auth_video');
  items.push({
    id: hit.id,
    pageURL: hit.pageURL,
    user: hit.user,
    tags: hit.tags,
    role: 'auth_video',
  });
  payload.items = items;

  const json = `${JSON.stringify(payload, null, 2)}\n`;
  await writeFile(attributionPath, json);
  await writeFile(publicAttributionPath, json);
  console.log('Done. auth-bg.mp4 + attribution updated.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
