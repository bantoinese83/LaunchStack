export const DICEBEAR_API_VERSION = '9.x';

/** Curated styles that read well at small sizes (Studio client list, account). */
export const DICEBEAR_STYLES = [
  { id: 'lorelei', label: 'Lorelei' },
  { id: 'avataaars', label: 'Avataaars' },
  { id: 'notionists', label: 'Notionists' },
  { id: 'personas', label: 'Personas' },
  { id: 'adventurer', label: 'Adventurer' },
  { id: 'micah', label: 'Micah' },
  { id: 'fun-emoji', label: 'Fun emoji' },
  { id: 'bottts', label: 'Bottts' },
] as const;

export type DiceBearStyleId = (typeof DICEBEAR_STYLES)[number]['id'];

const STYLE_IDS = new Set<string>(DICEBEAR_STYLES.map((s) => s.id));

export function isDiceBearStyleId(value: string): value is DiceBearStyleId {
  return STYLE_IDS.has(value);
}

export function sanitizeDiceBearSeed(seed: string): string {
  const trimmed = seed.trim().slice(0, 64);
  return trimmed.length ? trimmed : 'mystic';
}

export function buildDiceBearAvatarUrl(style: DiceBearStyleId, seed: string, size = 256): string {
  const safeSeed = encodeURIComponent(sanitizeDiceBearSeed(seed));
  const clampedSize = Math.min(512, Math.max(64, Math.round(size)));
  return `https://api.dicebear.com/${DICEBEAR_API_VERSION}/${style}/png?seed=${safeSeed}&size=${clampedSize}`;
}

export function isDiceBearAvatarUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === 'api.dicebear.com';
  } catch {
    return false;
  }
}

export function parseDiceBearAvatarUrl(
  url: string
): { style: DiceBearStyleId; seed: string } | null {
  if (!isDiceBearAvatarUrl(url)) return null;
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    const versionIdx = parts.findIndex((p) => p.endsWith('.x') || p === DICEBEAR_API_VERSION);
    const stylePart = parts[versionIdx + 1];
    if (!stylePart || !isDiceBearStyleId(stylePart)) return null;
    const seed = u.searchParams.get('seed') ?? 'mystic';
    return { style: stylePart, seed: decodeURIComponent(seed) };
  } catch {
    return null;
  }
}
