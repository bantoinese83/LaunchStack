#!/usr/bin/env node
/**
 * Fetches distinct Pixabay photos + auth video + service icons (no duplicate hit IDs).
 * Requires PIXABAY_API_KEY in apps/web/.env.local
 *
 * Usage: pnpm fetch:pixabay
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  attributionPath,
  download,
  loadPixabayKey,
  marketingDir,
  pickUniqueHit,
  pickUniqueVideo,
  root,
  searchPhotos,
  searchVideos,
} from './lib/pixabay-env.mjs';

const PHOTO_SLOTS = [
  {
    role: 'hero',
    file: 'hero.jpg',
    minWidth: 1600,
    params: {
      q: 'woman blow dry hair salon',
      image_type: 'photo',
      orientation: 'horizontal',
      category: 'fashion',
    },
  },
  {
    role: 'hero_bg',
    file: 'hero-bg.jpg',
    minWidth: 1920,
    params: {
      q: 'hair salon mirror lights bokeh',
      image_type: 'photo',
      orientation: 'horizontal',
      category: 'fashion',
    },
  },
  {
    role: 'stylist',
    file: 'stylist.jpg',
    minWidth: 1200,
    params: {
      q: 'hairdresser scissors haircut client',
      image_type: 'photo',
      orientation: 'horizontal',
      category: 'people',
    },
  },
  {
    role: 'auth_poster',
    file: 'auth-poster.jpg',
    minWidth: 1280,
    params: {
      q: 'beauty salon mirror lights',
      image_type: 'photo',
      orientation: 'horizontal',
      category: 'fashion',
    },
  },
];

const SERVICE_ICON_SLOTS = [
  { role: 'icon_blowout', file: 'service-icons/blowout.jpg', q: 'blowout hairstyle woman' },
  { role: 'icon_haircut', file: 'service-icons/haircut.jpg', q: 'haircut salon woman' },
  { role: 'icon_updo', file: 'service-icons/updo.jpg', q: 'updo hairstyle elegant' },
  { role: 'icon_dry_style', file: 'service-icons/dry-style.jpg', q: 'curly hair styling' },
];

async function main() {
  const key = loadPixabayKey();
  if (!key) {
    console.error('Set PIXABAY_API_KEY in apps/web/.env.local');
    process.exit(1);
  }

  await mkdir(marketingDir, { recursive: true });
  await mkdir(join(marketingDir, 'service-icons'), { recursive: true });

  const usedIds = new Set();
  const usedUsers = [];
  const items = [];

  for (const slot of PHOTO_SLOTS) {
    const data = await searchPhotos(key, slot.params);
    const hit = pickUniqueHit(data.hits, usedIds, {
      minWidth: slot.minWidth,
      blockedUsers: usedUsers,
    });
    if (!hit) {
      console.warn(`No unique photo for ${slot.role}`);
      continue;
    }
    usedIds.add(hit.id);
    usedUsers.push(hit.user);
    const src = hit.largeImageURL || hit.webformatURL;
    console.log(`${slot.role} → ${slot.file} (id ${hit.id}, ${hit.user})`);
    await download(src, join(marketingDir, slot.file));
    items.push({
      id: hit.id,
      pageURL: hit.pageURL,
      user: hit.user,
      tags: hit.tags,
      role: slot.role,
    });
  }

  for (const slot of SERVICE_ICON_SLOTS) {
    const data = await searchPhotos(key, {
      q: slot.q,
      image_type: 'photo',
      orientation: 'horizontal',
      min_width: '800',
    });
    const hit = pickUniqueHit(data.hits, usedIds, { minWidth: 800, blockedUsers: usedUsers });
    if (!hit) continue;
    usedIds.add(hit.id);
    const src = hit.webformatURL || hit.largeImageURL;
    console.log(`${slot.role} → ${slot.file} (id ${hit.id})`);
    await download(src, join(marketingDir, slot.file));
    items.push({
      id: hit.id,
      pageURL: hit.pageURL,
      user: hit.user,
      tags: hit.tags,
      role: slot.role,
    });
  }

  async function fetchVideoSlot({ role, file, q }) {
    const videoData = await searchVideos(key, { q, video_type: 'film' });
    const videoHit = pickUniqueVideo(videoData.hits, usedIds, { blockedUsers: usedUsers });
    if (!videoHit) {
      console.warn(`No unique video for ${role} — keeping existing ${file} if present`);
      return;
    }
    const videoUrl =
      videoHit.videos?.medium?.url ||
      videoHit.videos?.small?.url ||
      videoHit.videos?.large?.url;
    if (!videoUrl) return;
    usedIds.add(videoHit.id);
    usedUsers.push(videoHit.user);
    console.log(`${role} → ${file} (id ${videoHit.id}, ${videoHit.user})`);
    await download(videoUrl, join(marketingDir, file));
    items.push({
      id: videoHit.id,
      pageURL: videoHit.pageURL,
      user: videoHit.user,
      tags: videoHit.tags,
      role,
    });
  }

  await fetchVideoSlot({
    role: 'auth_video',
    file: 'auth-bg.mp4',
    q: 'hair salon stylist working',
  });
  const payload = {
    source: 'Pixabay',
    license: 'Pixabay Content License',
    fetchedAt: new Date().toISOString(),
    items,
  };
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  await writeFile(attributionPath, json);
  await writeFile(join(marketingDir, 'attribution.json'), json);
  console.log(`Done. ${items.length} assets → public/marketing/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
