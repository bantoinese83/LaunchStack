/** Canvas flower field — adapted from Gabi's CodePen "Some flowers" (Bezier petals). */

export const MYSTIC_HERO_FLOWER_COLORS = [
  '#6b4f5b',
  '#c4a962',
  '#7a8f6e',
  '#930c37',
  '#ea767a',
  '#ee6133',
  '#ecac43',
  '#fb9983',
  '#f9bc9f',
  '#ecd5f5',
  '#d1f2fd',
  '#8520b4',
  '#FA2E59',
  '#FF703F',
  '#F7BC05',
  '#76BCAD',
] as const;

const RAD = Math.PI / 180;
const TANGENT = 1 / 5;

export type FlowerSpec = {
  cx: number;
  cy: number;
  R: number;
  Ri: number;
  k: number;
  ki: number;
  K: number;
  fs: string;
  cs: string;
  nP: number;
  spacing: number;
  /** When global scroll progress (0–1) reaches this, the flower starts opening. */
  bloomGate: number;
  kStart: number;
  RStart: number;
  kTarget: number;
  RTarget: number;
  /** Subtle idle motion phase. */
  wobblePhase: number;
};

/** Time-driven hero blooms — spawn, open, hold, fade, repeat. */
export type LiveFlowerSpec = FlowerSpec & {
  id: number;
  bornMs: number;
  fadeStartMs: number;
  fadeDurationMs: number;
};

export const LIVE_BLOOM_MS = 2600;
export const LIVE_FADE_MS = 3400;
export const LIVE_HOLD_MS_MIN = 7000;
export const LIVE_HOLD_MS_MAX = 18000;

const BLOOM_WINDOW = 0.22;

export function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/** Slow time-based bloom on first paint (combined with scroll in the hero canvas). */
export function heroEntranceBloomProgress(timeMs: number, startMs: number, durationMs = 5600) {
  if (durationMs <= 0) return 0;
  return easeOutCubic(clamp01((timeMs - startMs) / durationMs)) * 1.12;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function finalizeBloomTargets(flower: FlowerSpec, width: number, height: number) {
  flower.kStart = flower.k;
  flower.RStart = flower.R;
  flower.kTarget = flower.K;
  let R = flower.R;
  let k = flower.k;
  while (k < flower.K) {
    R += flower.Ri;
    k += flower.ki;
  }
  flower.RTarget = R;
  flower.wobblePhase = Math.random() * Math.PI * 2;
  const vertical = height > 0 ? flower.cy / height : 0;
  const horizontal = width > 0 ? flower.cx / width : 0;
  flower.bloomGate = clamp01(vertical * 0.52 + horizontal * 0.12 + Math.random() * 0.28);
}

type Point = { x: number; y: number; a?: number };

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function pickColor() {
  return MYSTIC_HERO_FLOWER_COLORS[randomInt(0, MYSTIC_HERO_FLOWER_COLORS.length - 1)];
}

function randomFlowerSpec(width: number, height: number, margin = 24): FlowerSpec {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const flower: FlowerSpec = {
    cx: randomInt(margin, Math.max(margin, w - margin)),
    cy: randomInt(margin, Math.max(margin, h - margin)),
    R: randomInt(18, 46),
    Ri: randomInt(5, 7) / 10,
    k: randomInt(5, 10) / 10,
    ki: randomInt(2, 7) / 100,
    K: randomInt(5, 16) / 10,
    fs: pickColor(),
    cs: pickColor(),
    nP: randomInt(4, 10),
    spacing: randomInt(4, 10),
    bloomGate: 0,
    kStart: 0,
    RStart: 0,
    kTarget: 0,
    RTarget: 0,
    wobblePhase: 0,
  };
  finalizeBloomTargets(flower, w, h);
  return flower;
}

export function spawnLiveFlower(
  width: number,
  height: number,
  bornMs: number,
  id: number
): LiveFlowerSpec {
  const base = randomFlowerSpec(width, height);
  const hold = LIVE_HOLD_MS_MIN + Math.random() * (LIVE_HOLD_MS_MAX - LIVE_HOLD_MS_MIN);
  return {
    ...base,
    id,
    bornMs,
    fadeStartMs: bornMs + LIVE_BLOOM_MS + hold,
    fadeDurationMs: LIVE_FADE_MS,
  };
}

export function initLiveFlowerField(
  width: number,
  height: number,
  count: number,
  nowMs: number,
  startId = 0
): LiveFlowerSpec[] {
  const flowers: LiveFlowerSpec[] = [];
  for (let i = 0; i < count; i++) {
    const stagger = Math.random() * 9000;
    flowers.push(spawnLiveFlower(width, height, nowMs - stagger, startId + i));
  }
  return flowers;
}

export function liveFlowerProgress(flower: LiveFlowerSpec, timeMs: number) {
  const bloom = easeOutCubic(clamp01((timeMs - flower.bornMs) / LIVE_BLOOM_MS));
  let alpha = 1;
  if (timeMs > flower.fadeStartMs) {
    alpha = 1 - easeOutCubic(clamp01((timeMs - flower.fadeStartMs) / flower.fadeDurationMs));
  }
  return { t: bloom, alpha };
}

export function pruneLiveFlowers(flowers: LiveFlowerSpec[], timeMs: number) {
  return flowers.filter((f) => liveFlowerProgress(f, timeMs).alpha > 0.015);
}

export function createFlowerField(width: number, height: number, count: number): FlowerSpec[] {
  const flowers: FlowerSpec[] = [];
  for (let i = 0; i < count; i++) {
    flowers.push(randomFlowerSpec(width, height));
  }
  flowers.sort((a, b) => a.bloomGate - b.bloomGate);
  return flowers;
}

function buildPetals(
  R: number,
  k: number,
  cx: number,
  cy: number,
  nP: number,
  spacing: number
): Point[][] {
  const r = R * k;
  const A = 360 / nP;
  const petals: Point[][] = [];
  for (let i = 0; i < nP; i++) {
    const ry: Point[] = [{ x: cx, y: cy }];
    const a1 = i * A + spacing;
    ry.push({ x: cx + R * Math.cos(a1 * RAD), y: cy + R * Math.sin(a1 * RAD), a: a1 });
    const a2 = i * A + A / 2;
    ry.push({ x: cx + r * Math.cos(a2 * RAD), y: cy + r * Math.sin(a2 * RAD), a: a2 });
    const a3 = i * A + A - spacing;
    ry.push({ x: cx + R * Math.cos(a3 * RAD), y: cy + R * Math.sin(a3 * RAD), a: a3 });
    ry.push({ x: cx, y: cy });
    petals[i] = ry;
  }
  return petals;
}

function controlPoints(p: Point[]): Point[][] {
  const pc: Point[][] = [];
  for (let i = 1; i < p.length - 1; i++) {
    const dx = p[i - 1].x - p[i + 1].x;
    const dy = p[i - 1].y - p[i + 1].y;
    pc[i] = [
      { x: p[i].x - dx * TANGENT, y: p[i].y - dy * TANGENT },
      { x: p[i].x + dx * TANGENT, y: p[i].y + dy * TANGENT },
    ];
  }
  return pc;
}

function drawCurve(ctx: CanvasRenderingContext2D, p: Point[]) {
  const pc = controlPoints(p);
  const c1 = pc[1]?.[1];
  if (!c1) return;
  ctx.beginPath();
  ctx.moveTo(p[0].x, p[0].y);
  ctx.quadraticCurveTo(c1.x, c1.y, p[1].x, p[1].y);
  if (p.length > 2) {
    for (let i = 1; i < p.length - 2; i++) {
      const a = pc[i]?.[0];
      const b = pc[i + 1]?.[1];
      if (!a || !b) continue;
      ctx.bezierCurveTo(a.x, a.y, b.x, b.y, p[i + 1].x, p[i + 1].y);
    }
    const n = p.length - 1;
    const cn = pc[n - 1]?.[0];
    if (cn) ctx.quadraticCurveTo(cn.x, cn.y, p[n].x, p[n].y);
  }
  ctx.fill();
}

function drawCenter(ctx: CanvasRenderingContext2D, k: number, cx: number, cy: number, cs: string) {
  ctx.beginPath();
  ctx.fillStyle = cs;
  ctx.arc(cx, cy, k * 10, 0, 2 * Math.PI);
  ctx.fill();
}

export type DrawFlowersOptions = {
  /** Wall-clock ms for gentle sway on fully open blooms. */
  timeMs?: number;
  idleMotion?: boolean;
};

/**
 * Draw flowers at bloom amount driven by scroll progress (0–1 through the hero).
 * Each flower opens over `BLOOM_WINDOW` of that progress, staggered by `bloomGate`.
 */
function drawFlowerAtProgress(
  ctx: CanvasRenderingContext2D,
  flower: FlowerSpec,
  t: number,
  timeMs: number,
  idleMotion: boolean,
  alpha: number
) {
  if (t <= 0.001 || alpha <= 0.01) return;

  let k = flower.kStart + (flower.kTarget - flower.kStart) * t;
  let R = flower.RStart + (flower.RTarget - flower.RStart) * t;

  if (idleMotion && t >= 0.92 && timeMs > 0) {
    const breathe = Math.sin(timeMs * 0.0012 + flower.wobblePhase) * 0.022;
    k *= 1 + breathe;
    R *= 1 + breathe * 0.6;
  }

  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = prevAlpha * alpha;

  const petals = buildPetals(R, k, flower.cx, flower.cy, flower.nP, flower.spacing);
  ctx.fillStyle = flower.fs;
  for (const petal of petals) {
    drawCurve(ctx, petal);
  }
  drawCenter(ctx, k, flower.cx, flower.cy, flower.cs);
  ctx.globalAlpha = prevAlpha;
}

export function drawHeroFlowers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  flowers: FlowerSpec[],
  scrollProgress: number,
  options: DrawFlowersOptions = {}
) {
  const { timeMs = 0, idleMotion = true } = options;
  ctx.clearRect(0, 0, width, height);

  for (const flower of flowers) {
    const local = clamp01((scrollProgress - flower.bloomGate) / BLOOM_WINDOW);
    const t = easeOutCubic(local);
    drawFlowerAtProgress(ctx, flower, t, timeMs, idleMotion, 1);
  }
}

/** Continuous bloom field — each flower opens on its own timeline. */
export function drawLiveHeroFlowers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  flowers: LiveFlowerSpec[],
  timeMs: number,
  options: DrawFlowersOptions = {}
) {
  const { idleMotion = true } = options;
  ctx.clearRect(0, 0, width, height);

  for (const flower of flowers) {
    const { t, alpha } = liveFlowerProgress(flower, timeMs);
    drawFlowerAtProgress(ctx, flower, t, timeMs, idleMotion, alpha);
  }
}

/** Full bloom for reduced-motion / static frame. */
export function scrollProgressFullyBloomed() {
  return 1.25;
}

/**
 * Map hero section position to 0–1 bloom progress (higher = more flowers open).
 * Blooms spread across the hero entering view and scrolling through it.
 */
export function heroBloomScrollProgress(section: HTMLElement): number {
  const rect = section.getBoundingClientRect();
  const vh = window.innerHeight;
  const start = vh * 0.92;
  const end = -rect.height * 0.25;
  const span = start - end;
  if (span <= 0) return 0;
  return clamp01((start - rect.top) / span);
}

export function flowerCountForSize(width: number, height: number) {
  const area = width * height;
  return Math.min(100, Math.max(36, Math.round(area / 12000)));
}
