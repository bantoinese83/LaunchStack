/** Flowing ribbon waves — adapted from a CodePen particle-wave sketch. */

export const MYSTIC_WAVE_COLORS = [
  'rgba(196, 169, 98, 0.55)',
  'rgba(122, 143, 110, 0.5)',
  'rgba(107, 79, 91, 0.58)',
  'rgba(196, 169, 98, 0.38)',
  'rgba(90, 107, 82, 0.45)',
] as const;

const RAD = Math.PI / 180;

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

class Particle {
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  timeIncrement: number;
  in = true;

  constructor(x: number, N: number, cw: number, cx: number) {
    this.pos = {
      x: x + (Math.random() * cw) / (N * 2) - cx / (N * 2),
      y: -100,
    };
    this.vel = { x: 0, y: 0 };
    this.timeIncrement = this.pos.x * 10;
  }

  update(moment: number, frames: number, ch: number) {
    const t = moment + this.timeIncrement;
    this.vel.y = 1 + Math.cos(t / 23 + Math.cos(t / 29 + frames * RAD));
    this.pos.y += this.vel.y;
    if (this.pos.y > ch && this.in) {
      this.in = false;
      return 1;
    }
    return 0;
  }
}

export class Wave {
  color: string;
  N: number;
  particles: Particle[] = [];
  memory = 0;
  dashArray: number[] = [];

  constructor(color: string, cw: number, ch: number, cx: number) {
    this.color = color;
    this.N = 10;
    this.create(cw, ch, cx);
    this.setLineDash();
  }

  create(cw: number, _ch: number, cx: number) {
    const first = new Particle(-100, this.N, cw, cx);
    first.pos.y = -1000;
    this.particles.push(first);
    const second = new Particle(-100, this.N, cw, cx);
    this.particles.push(second);
    for (let i = 0; i < this.N; i++) {
      const x = (i * cw) / this.N;
      this.particles.push(new Particle(x, this.N, cw, cx));
    }
    this.particles.push(new Particle(cw + 100, this.N, cw, cx));
    const last = new Particle(cw + 100, this.N, cw, cx);
    last.pos.y = -1000;
    this.particles.push(last);
  }

  setLineDash() {
    this.dashArray = [];
    for (let i = 1; i < this.particles.length - 3; i++) {
      const d = dist(this.particles[i].pos, this.particles[i + 1].pos);
      this.dashArray.push(d / 3);
      this.dashArray.push((2 * d) / 3);
    }
  }

  connect(ctx: CanvasRenderingContext2D) {
    this.setLineDash();
    const points = this.particles;
    ctx.beginPath();
    ctx.moveTo(points[0].pos.x, points[0].pos.y);
    let i = 1;
    for (; i < points.length - 2; i++) {
      const cpX = (points[i].pos.x + points[i + 1].pos.x) / 2;
      const cpY = (points[i].pos.y + points[i + 1].pos.y) / 2;
      ctx.quadraticCurveTo(points[i].pos.x, points[i].pos.y, cpX, cpY);
    }
    ctx.quadraticCurveTo(
      points[i].pos.x,
      points[i].pos.y,
      points[i + 1].pos.x,
      points[i + 1].pos.y
    );
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = this.color;
    ctx.setLineDash([]);
    ctx.lineWidth = 30;
    ctx.stroke();
    ctx.lineWidth = 20;
    ctx.setLineDash(this.dashArray);
    ctx.strokeStyle = 'rgba(255,255,255,.22)';
    ctx.stroke();
  }

  draw(ctx: CanvasRenderingContext2D, moment: number, frames: number, ch: number) {
    for (const p of this.particles) {
      this.memory += p.update(moment, frames, ch);
    }
    this.connect(ctx);
  }

  isExpired() {
    return this.memory >= this.N + 4;
  }
}

export function pickWaveColor(index: number) {
  return MYSTIC_WAVE_COLORS[index % MYSTIC_WAVE_COLORS.length];
}

export const WAVE_SPAWN_INTERVAL = 200;
export const MAX_WAVES = 6;
