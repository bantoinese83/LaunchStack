/**
 * Removes the JPEG's dark background and exports PNG lockups for light/dark surfaces.
 * Run: node scripts/process-mystic-logo.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'apps/web/public/brand/mystic-hair-logo.jpeg');
const outLight = join(root, 'apps/web/public/brand/mystic-hair-logo-light.png');
const outDark = join(root, 'apps/web/public/brand/mystic-hair-logo-dark.png');
const mobileAssets = join(root, 'apps/mobile/assets');

const py = `
from PIL import Image

src = ${JSON.stringify(src)}
out_light = ${JSON.stringify(outLight)}
out_dark = ${JSON.stringify(outDark)}

INK = (26, 31, 24)  # --shell / ink on paper
WHITE = (247, 244, 237)  # --paper

img = Image.open(src).convert('RGBA')
w, h = img.size
light = Image.new('RGBA', (w, h))
dark = Image.new('RGBA', (w, h))

# White logo on black JPEG: recover alpha from luminance after dropping charcoal bg.
BG_MAX = 28

for y in range(h):
    for x in range(w):
        r, g, b, _ = img.getpixel((x, y))
        m = max(r, g, b)
        if m <= BG_MAX:
            continue
        t = (m - BG_MAX) / (255 - BG_MAX)
        a = int(t * 255)
        if a <= 0:
            continue
        light.putpixel((x, y), (*INK, a))
        dark.putpixel((x, y), (*WHITE, a))

for out, im in ((out_light, light), (out_dark, dark)):
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    im.save(out, optimize=True)
    print('Wrote', out, im.size)

mobile = ${JSON.stringify(mobileAssets)}
import shutil
shutil.copy2(out_light, mobile + '/mystic-hair-logo-light.png')
shutil.copy2(out_dark, mobile + '/mystic-hair-logo-dark.png')

logo = Image.open(out_light).convert('RGBA')
PAPER = (247, 244, 237, 255)

def paste_centered(canvas, mark, width):
    scale = width / mark.width
    height = int(mark.height * scale)
    resized = mark.resize((width, height), Image.Resampling.LANCZOS)
    x = (canvas.width - width) // 2
    y = (canvas.height - height) // 2
    canvas.paste(resized, (x, y), resized)
    return resized, x, y

splash = Image.new('RGBA', (1284, 2778), PAPER)
paste_centered(splash, logo, 720)
splash.convert('RGB').save(mobile + '/splash.png', optimize=True)

icon_size = 1024
icon = Image.new('RGBA', (icon_size, icon_size), PAPER)
resized, x, y = paste_centered(icon, logo, 820)
icon.save(mobile + '/icon.png', optimize=True)

fg = Image.new('RGBA', (icon_size, icon_size), (0, 0, 0, 0))
fg.paste(resized, (x, y), resized)
fg.save(mobile + '/adaptive-icon.png', optimize=True)
print('Wrote mobile splash + icon assets')
`;

const r = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
if (r.status !== 0) {
  console.error(r.stderr || r.stdout);
  process.exit(1);
}
console.log(r.stdout);
