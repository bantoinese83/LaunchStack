#!/usr/bin/env node
/**
 * Downloads Pixabay photos into apps/web/public/marketing/ (no permanent hotlinking).
 * Requires PIXABAY_API_KEY in env or apps/web/.env.local
 *
 * Usage: node scripts/fetch-pixabay-marketing.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'apps/web/public/marketing');

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

async function searchPixabay(key, params) {
  const url = new URL('https://pixabay.com/api/');
  url.searchParams.set('key', key);
  url.searchParams.set('safesearch', 'true');
  url.searchParams.set('per_page', '5');
  url.searchParams.set('order', 'popular');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pixabay ${res.status}: ${await res.text()}`);
  return res.json();
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status} ${url}`);
  await pipeline(res.body, createWriteStream(dest));
}

function pickHit(hits, minWidth = 1280) {
  return hits.find((h) => h.imageWidth >= minWidth) ?? hits[0];
}

const QUERIES = [
  {
    role: 'hero',
    file: 'hero.jpg',
    params: {
      q: 'woman hair salon blow dry',
      image_type: 'photo',
      orientation: 'horizontal',
      category: 'fashion',
      min_width: '1600',
    },
  },
  {
    role: 'stylist',
    file: 'stylist.jpg',
    params: {
      q: 'hairdresser styling hair',
      image_type: 'photo',
      orientation: 'horizontal',
      category: 'people',
      min_width: '1200',
    },
  },
];

async function main() {
  const key = loadKey();
  if (!key) {
    console.error('Set PIXABAY_API_KEY in env or apps/web/.env.local');
    process.exit(1);
  }

  await mkdir(outDir, { recursive: true });
  const attribution = [];

  for (const item of QUERIES) {
    const data = await searchPixabay(key, item.params);
    if (!data.hits?.length) {
      console.warn(`No hits for ${item.role} (${item.params.q})`);
      continue;
    }
    const hit = pickHit(data.hits);
    const src = hit.largeImageURL || hit.webformatURL;
    const dest = join(outDir, item.file);
    console.log(`Downloading ${item.role} → ${item.file} (${hit.imageWidth}x${hit.imageHeight})`);
    await download(src, dest);
    attribution.push({
      id: hit.id,
      pageURL: hit.pageURL,
      user: hit.user,
      tags: hit.tags,
      role: item.role,
    });
  }

  const payload = {
    source: 'Pixabay',
    license: 'Pixabay Content License',
    items: attribution,
  };
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  await writeFile(join(outDir, 'attribution.json'), json);
  await writeFile(join(root, 'apps/web/src/lib/mystic/marketing-attribution.json'), json);
  console.log('Done. Attribution synced to public/marketing and src/lib/mystic/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
