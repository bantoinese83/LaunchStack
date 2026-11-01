/** Palette aligned with web hero flowers (CodePen / Mystic brand). */
export const MYSTIC_HERO_FLOWER_COLORS = [
  '#6b4f5b',
  '#c4a962',
  '#7a8f6e',
  '#ea767a',
  '#ecac43',
  '#fb9983',
  '#ecd5f5',
  '#d1f2fd',
  '#8520b4',
  '#76BCAD',
] as const;

export type MobileFlowerSeed = {
  id: string;
  x: number;
  y: number;
  size: number;
  petals: number;
  petalColor: string;
  centerColor: string;
  bloomDelayMs: number;
  wobblePhase: number;
};

/** Stagger blooms across the splash window (ms). */
export function buildMobileFlowerField(
  width: number,
  height: number,
  count = 28,
  options?: { maxBloomDelayMs?: number; staggerMs?: number }
): MobileFlowerSeed[] {
  const maxBloomDelayMs = options?.maxBloomDelayMs ?? 2200;
  const staggerMs = options?.staggerMs ?? 35;
  const flowers: MobileFlowerSeed[] = [];
  let seed = 915_337;
  const rand = () => {
    seed = (seed * 1_103_515_245 + 12_345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  for (let i = 0; i < count; i++) {
    const petalIdx = Math.floor(rand() * MYSTIC_HERO_FLOWER_COLORS.length);
    let centerIdx = Math.floor(rand() * MYSTIC_HERO_FLOWER_COLORS.length);
    if (centerIdx === petalIdx) centerIdx = (centerIdx + 1) % MYSTIC_HERO_FLOWER_COLORS.length;
    flowers.push({
      id: `f-${i}`,
      x: rand() * width,
      y: rand() * height,
      size: 28 + rand() * 44,
      petals: 4 + Math.floor(rand() * 7),
      petalColor: MYSTIC_HERO_FLOWER_COLORS[petalIdx],
      centerColor: MYSTIC_HERO_FLOWER_COLORS[centerIdx],
      bloomDelayMs: Math.floor(rand() * maxBloomDelayMs) + i * staggerMs,
      wobblePhase: rand() * Math.PI * 2,
    });
  }

  flowers.sort((a, b) => a.bloomDelayMs - b.bloomDelayMs);
  return flowers;
}
