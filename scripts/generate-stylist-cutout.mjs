#!/usr/bin/env node
/**
 * Regenerate stylist-cutout.png from stylist.jpg (studio green keyed out).
 * Requires Pillow: python3 -m pip install pillow
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'apps/web/public/marketing/stylist.jpg');
const outWeb = path.join(root, 'apps/web/public/marketing/stylist-cutout.png');
const outMobile = path.join(root, 'apps/mobile/assets/marketing/stylist-cutout.png');

const py = `
from PIL import Image
import math
src = ${JSON.stringify(src)}
out = ${JSON.stringify(outWeb)}
img = Image.open(src).convert("RGBA")
px = img.load()
w, h = img.size
samples = [px[0,0], px[w-1,0], px[0,h-1], px[w-1,h-1]]
bg = tuple(sum(c[i] for c in samples)//4 for i in range(3))
threshold = 42
for y in range(h):
    for x in range(w):
        r,g,b,a = px[x,y]
        dist = math.sqrt((r-bg[0])**2 + (g-bg[1])**2 + (b-bg[2])**2)
        if dist < threshold:
            px[x,y] = (r,g,b,0)
        elif dist < threshold + 35:
            t = (dist - threshold) / 35
            px[x,y] = (r,g,b,int(255*t))
img.save(out)
print("wrote", out)
`;

const r = spawnSync('python3', ['-c', py], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status ?? 1);

spawnSync('cp', [outWeb, outMobile], { stdio: 'inherit' });
