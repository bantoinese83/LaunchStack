'use client';

/**
 * Flick / flip card (Kokonut UI CardFlip, adapted for Mystic).
 * @see https://kokonutui.com
 */

import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

const DEG_PER_PX = 0.6;
const STIFFNESS = 170;
const DAMPING = 20;
const PROJECTION = 0.22;
const FLICK_SPEED = 450;
const MAX_HALF_TURNS = 6;
const DRAG_SLOP = 4;
const LIFT = 36;
const TILT = 6;
const THICKNESS = 6;
const SLICES = 7;
const SLICE_DEPTHS = Array.from(
  { length: SLICES },
  (_, i) => -THICKNESS / 2 + (THICKNESS * (i + 0.5)) / SLICES
);
const SUBSTEP = 1 / 240;
const VELOCITY_WINDOW = 80;

const INTERACTIVE = 'button, a, input, select, textarea, [data-no-flip]';

type Axis = 'x' | 'y';

export interface MysticCardFlipProps {
  front: ReactNode;
  back: ReactNode;
  flipped?: boolean;
  defaultFlipped?: boolean;
  onFlippedChange?: (flipped: boolean) => void;
  /** Tap / Enter on the front face selects without flipping. */
  selectOnFrontPress?: boolean;
  onFrontPress?: () => void;
  axis?: Axis;
  label?: string;
  className?: string;
  faceClassName?: string;
}

const mod2 = (n: number) => ((n % 2) + 2) % 2;
const sideOf = (angle: number) => mod2(Math.round(angle / 180)) === 1;
const nearestFace = (angle: number) => Math.round(angle / 180) * 180;

interface Sim {
  angle: number;
  velocity: number;
  target: number;
  raf: number;
  last: number;
  reduceMotion: boolean;
  pointerId: number | null;
  startX: number;
  startY: number;
  startAngle: number;
  dragging: boolean;
  samples: { t: number; a: number }[];
}

function cardTransform(axis: Axis, angle: number, lift: number) {
  const rotate = axis === 'y' ? 'rotateY' : 'rotateX';
  return `translateZ(${lift.toFixed(2)}px) ${rotate}(${angle.toFixed(2)}deg)`;
}

function paintLight(
  axis: Axis,
  sin: number,
  bands: (HTMLDivElement | null)[],
  shades: (HTMLDivElement | null)[]
) {
  const turn = Math.abs(sin);
  const shift = `${(sin * 140).toFixed(1)}%`;
  const transform =
    axis === 'y' ? `translateX(${shift}) rotate(18deg)` : `translateY(${shift}) rotate(72deg)`;
  for (const band of bands) {
    if (band) {
      band.style.opacity = (turn * 0.12).toFixed(3);
      band.style.transform = transform;
    }
  }
  for (const shade of shades) {
    if (shade) {
      shade.style.opacity = (turn * 0.14).toFixed(3);
    }
  }
}

function releaseVelocity(samples: Sim['samples'], now: number) {
  const last = samples.at(-1);
  if (!last || now - last.t > VELOCITY_WINDOW) {
    return 0;
  }
  const first = samples.find((p) => last.t - p.t <= VELOCITY_WINDOW);
  if (!first || last.t <= first.t) {
    return 0;
  }
  return ((last.a - first.a) / (last.t - first.t)) * 1000;
}

export function MysticCardFlip({
  front,
  back,
  flipped,
  defaultFlipped = false,
  onFlippedChange,
  selectOnFrontPress = false,
  onFrontPress,
  axis = 'y',
  label = 'Flip card',
  className,
  faceClassName,
}: MysticCardFlipProps) {
  const isControlled = flipped !== undefined;
  const [internalFlipped, setInternalFlipped] = useState(defaultFlipped);
  const isFlipped = isControlled ? flipped : internalFlipped;
  const [backVisible, setBackVisible] = useState(isFlipped);
  const [request, setRequest] = useState(0);
  const hintId = useId();

  const rootRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const frontBandRef = useRef<HTMLDivElement>(null);
  const backBandRef = useRef<HTMLDivElement>(null);
  const frontShadeRef = useRef<HTMLDivElement>(null);
  const backShadeRef = useRef<HTMLDivElement>(null);

  const [initial] = useState(() => {
    const angle = isFlipped ? 180 : 0;
    return {
      angle,
      card: { transform: cardTransform(axis, angle, 0) },
      front: { transform: `translateZ(${THICKNESS / 2}px)` },
    };
  });

  const sim = useRef<Sim>({
    angle: initial.angle,
    velocity: 0,
    target: initial.angle,
    raf: 0,
    last: 0,
    reduceMotion: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startAngle: 0,
    dragging: false,
    samples: [],
  });

  const latest = useRef({
    axis,
    isFlipped,
    isControlled,
    onFlippedChange,
    selectOnFrontPress,
    onFrontPress,
  });
  useLayoutEffect(() => {
    latest.current = {
      axis,
      isFlipped,
      isControlled,
      onFlippedChange,
      selectOnFrontPress,
      onFrontPress,
    };
  });
  const backVisibleRef = useRef(backVisible);
  const stepRef = useRef<(now: number) => void>(() => {});

  const render = useCallback(() => {
    const s = sim.current;
    const ax = latest.current.axis;
    const rad = (s.angle * Math.PI) / 180;
    const sin = Math.sin(rad);
    const turn = Math.abs(sin);
    const facing = Math.abs(Math.cos(rad));

    if (cardRef.current) {
      cardRef.current.style.transform = cardTransform(ax, s.angle, turn * LIFT);
    }
    if (shadowRef.current) {
      const narrow = (0.16 + 0.84 * facing).toFixed(3);
      const soft = (1 - turn * 0.12).toFixed(3);
      shadowRef.current.style.transform =
        ax === 'y' ? `scale(${narrow}, ${soft})` : `scale(${soft}, ${narrow})`;
      shadowRef.current.style.opacity = (1 - turn * 0.45).toFixed(3);
    }
    paintLight(
      ax,
      sin,
      [frontBandRef.current, backBandRef.current],
      [frontShadeRef.current, backShadeRef.current]
    );

    const showsBack = sideOf(s.angle);
    if (showsBack !== backVisibleRef.current) {
      backVisibleRef.current = showsBack;
      setBackVisible(showsBack);
    }
  }, []);

  const step = useCallback(
    (now: number) => {
      const s = sim.current;
      const dt = Math.min(0.05, (now - s.last) / 1000);
      s.last = now;
      const n = Math.max(1, Math.ceil(dt / SUBSTEP));
      const h = dt / n;
      for (let i = 0; i < n; i++) {
        const force = -STIFFNESS * (s.angle - s.target) - DAMPING * s.velocity;
        s.velocity += force * h;
        s.angle += s.velocity * h;
      }
      if (Math.abs(s.angle - s.target) < 0.05 && Math.abs(s.velocity) < 0.5) {
        s.target = sideOf(s.target) ? 180 : 0;
        s.angle = s.target;
        s.velocity = 0;
        s.raf = 0;
        render();
        return;
      }
      render();
      s.raf = requestAnimationFrame((t) => stepRef.current(t));
    },
    [render]
  );

  useLayoutEffect(() => {
    stepRef.current = step;
  }, [step]);

  const settle = useCallback(() => {
    const s = sim.current;
    if (s.reduceMotion) {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.target = sideOf(s.target) ? 180 : 0;
      s.angle = s.target;
      s.velocity = 0;
      render();
      return;
    }
    if (!s.raf) {
      s.last = performance.now();
      s.raf = requestAnimationFrame(step);
    }
  }, [render, step]);

  const aim = useCallback(
    (target: number) => {
      sim.current.target = target;
      const next = sideOf(target);
      const p = latest.current;
      if (next !== p.isFlipped) {
        if (p.isControlled) {
          setRequest((n) => n + 1);
        } else {
          setInternalFlipped(next);
        }
        p.onFlippedChange?.(next);
      }
      settle();
    },
    [settle]
  );

  const flipBy = useCallback(
    (direction: number) => {
      aim(nearestFace(sim.current.target) + 180 * direction);
    },
    [aim]
  );

  useEffect(() => {
    const s = sim.current;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    s.reduceMotion = query.matches;
    const onChange = () => {
      s.reduceMotion = query.matches;
    };
    query.addEventListener('change', onChange);
    return () => {
      query.removeEventListener('change', onChange);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, []);

  useEffect(() => {
    if (flipped === undefined || request < 0) {
      return;
    }
    const s = sim.current;
    if (s.dragging || sideOf(s.target) === flipped) {
      return;
    }
    const face = nearestFace(s.angle);
    if (sideOf(face) === flipped) {
      s.target = face;
    } else {
      s.target = face + (s.angle < face ? -180 : 180);
    }
    settle();
  }, [flipped, request, settle]);

  useEffect(() => {
    latest.current.axis = axis;
    render();
  }, [axis, render]);

  const setTilt = (x: number, y: number) => {
    if (tiltRef.current) {
      tiltRef.current.style.transform = `rotateX(${(-y * TILT).toFixed(2)}deg) rotateY(${(x * TILT).toFixed(2)}deg)`;
    }
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const s = sim.current;
    if (s.pointerId !== null || e.button !== 0 || (e.target as Element).closest(INTERACTIVE)) {
      return;
    }
    s.pointerId = e.pointerId;
    s.startX = e.clientX;
    s.startY = e.clientY;
    s.startAngle = s.angle;
    s.dragging = false;
    s.samples = [{ t: e.timeStamp, a: s.angle }];
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const hoverTilt = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || sim.current.reduceMotion || !rootRef.current) {
      return;
    }
    const r = rootRef.current.getBoundingClientRect();
    setTilt(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = sim.current;
    if (s.pointerId !== e.pointerId) {
      hoverTilt(e);
      return;
    }
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (!s.dragging) {
      if (Math.hypot(dx, dy) < DRAG_SLOP) {
        return;
      }
      s.dragging = true;
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.velocity = 0;
      setTilt(0, 0);
    }
    s.angle = s.startAngle + (axis === 'y' ? dx : -dy) * DEG_PER_PX;
    s.samples.push({ t: e.timeStamp, a: s.angle });
    if (s.samples.length > 8) {
      s.samples.shift();
    }
    render();
  };

  const release = (e: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const s = sim.current;
    if (s.pointerId !== e.pointerId) {
      return;
    }
    s.pointerId = null;
    if (!s.dragging) {
      if (!cancelled) {
        const p = latest.current;
        if (p.selectOnFrontPress && !sideOf(s.angle)) {
          p.onFrontPress?.();
          return;
        }
        const r = e.currentTarget.getBoundingClientRect();
        const pushed =
          axis === 'y' ? e.clientX > r.left + r.width / 2 : e.clientY < r.top + r.height / 2;
        flipBy(pushed ? 1 : -1);
      }
      return;
    }
    s.dragging = false;

    const velocity = cancelled ? 0 : releaseVelocity(s.samples, e.timeStamp);
    const from = nearestFace(s.startAngle);
    let target = nearestFace(s.angle + velocity * PROJECTION);
    if (Math.abs(velocity) > FLICK_SPEED && target === from) {
      target = from + 180 * Math.sign(velocity);
    }
    const limit = MAX_HALF_TURNS * 180;
    target = Math.max(from - limit, Math.min(from + limit, target));
    s.velocity = velocity;
    aim(target);
    latest.current.onFrontPress?.();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) {
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const p = latest.current;
      if (p.selectOnFrontPress && !sideOf(sim.current.angle)) {
        p.onFrontPress?.();
        return;
      }
      flipBy(1);
    }
  };

  const face = cn(
    'absolute inset-0 overflow-hidden rounded-2xl [backface-visibility:hidden]',
    'border border-line/70 bg-surface text-ink',
    faceClassName
  );

  return (
    <div
      aria-describedby={hintId}
      aria-label={label}
      aria-roledescription="flip card"
      className={cn(
        'group/flick relative w-full max-w-none select-none rounded-2xl outline-hidden [perspective:1100px]',
        'focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
        axis === 'y' ? 'touch-pan-y' : 'touch-pan-x',
        className
      )}
      onKeyDown={onKeyDown}
      onLostPointerCapture={(e) => release(e, true)}
      onPointerCancel={(e) => release(e, true)}
      onPointerDown={onPointerDown}
      onPointerLeave={() => {
        if (sim.current.pointerId === null) {
          setTilt(0, 0);
        }
      }}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => release(e, false)}
      ref={rootRef}
      role="group"
      tabIndex={0}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[8%] -bottom-5 h-5 rounded-[50%] bg-shell/20 blur-md"
        ref={shadowRef}
      />

      <div
        className="relative h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] [transform-style:preserve-3d] motion-reduce:transition-none"
        ref={tiltRef}
      >
        <div
          className="relative h-full w-full cursor-grab rounded-2xl [transform-style:preserve-3d] group-active/flick:cursor-grabbing"
          ref={cardRef}
          style={initial.card}
        >
          {SLICE_DEPTHS.map((z) => (
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-2xl bg-gold/25"
              key={z}
              style={{ transform: `translateZ(${z.toFixed(3)}px)` }}
            />
          ))}

          <div
            aria-hidden={backVisible || undefined}
            className={face}
            inert={backVisible}
            style={initial.front}
          >
            {front}
            <LightBand bandRef={frontBandRef} shadeRef={frontShadeRef} />
          </div>

          <div
            aria-hidden={!backVisible || undefined}
            className={face}
            inert={!backVisible}
            style={{
              transform: `${axis === 'y' ? 'rotateY' : 'rotateX'}(180deg) translateZ(${THICKNESS / 2}px)`,
            }}
          >
            {back}
            <LightBand bandRef={backBandRef} shadeRef={backShadeRef} />
          </div>
        </div>
      </div>

      <span className="sr-only" id={hintId}>
        Showing the {isFlipped ? 'back' : 'front'}. Press Enter or Space, or drag, to turn it over.
        {isFlipped ? ' This service is selected.' : ''}
      </span>
    </div>
  );
}

function LightBand({
  bandRef,
  shadeRef,
}: {
  bandRef: Ref<HTMLDivElement>;
  shadeRef: Ref<HTMLDivElement>;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-shell opacity-0" ref={shadeRef} />
      <div className="h-[220%] w-1/3 shrink-0 bg-paper opacity-0" ref={bandRef} />
    </div>
  );
}
