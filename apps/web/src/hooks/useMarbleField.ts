import { useEffect, type RefObject } from 'react';

interface MarbleState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rx: number;
  ry: number;
  rvx: number;
  rvy: number;
  lx: number;
  ly: number;
  scale: number;
  vs: number;
}

const restLight = { x: 0.32, y: 0.24 };

/** Spring marbles: orbs lean, roll, and shift specular toward the pointer. */
export function useMarbleField(rootRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const fine = window.matchMedia('(pointer: fine)').matches;
    const states = new Map<HTMLElement, MarbleState>();
    let pointer: { x: number; y: number } | null = null;
    let hover: HTMLElement | null = null;
    let frame = 0;

    const ensure = (el: HTMLElement): MarbleState => {
      let state = states.get(el);
      if (!state) {
        state = {
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          rx: 0,
          ry: 0,
          rvx: 0,
          rvy: 0,
          lx: restLight.x,
          ly: restLight.y,
          scale: 1,
          vs: 0,
        };
        states.set(el, state);
      }
      return state;
    };

    const marbles = (): HTMLElement[] => [...root.querySelectorAll<HTMLElement>('[data-marble]')];

    const step = (): void => {
      let energy = 0;
      const list = marbles();

      if (pointer && fine) {
        let nearest: HTMLElement | null = null;
        let nearestDist = 52;
        for (const ball of list) {
          const orb = ball.closest<HTMLElement>('.tech-orb');
          if (!orb) continue;
          const rect = orb.getBoundingClientRect();
          const dist = Math.hypot(
            pointer.x - (rect.left + rect.width / 2),
            pointer.y - (rect.top + rect.height / 2)
          );
          if (dist < nearestDist) {
            nearestDist = dist;
            nearest = orb;
          }
        }
        hover = nearest;
      }

      for (const ball of list) {
        const orb = ball.closest<HTMLElement>('.tech-orb');
        if (!orb) continue;
        const state = ensure(ball);
        const rect = orb.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const isHover = orb === hover;

        let tx = 0;
        let ty = 0;
        let trx = 0;
        let tryRot = 0;
        let tlx = restLight.x;
        let tly = restLight.y;

        if (pointer && fine) {
          const dx = pointer.x - cx;
          const dy = pointer.y - cy;
          const dist = Math.hypot(dx, dy) || 1;
          const influence = Math.exp(-dist / 420);
          const reach = Math.min(1, 240 / dist);
          const pull = (isHover ? 36 : 22) * influence;
          tx = (dx / dist) * pull;
          ty = (dy / dist) * pull - (isHover ? 14 : 0);
          const roll = 32 * Math.min(1, influence * 1.75);
          trx = (-dy / dist) * roll;
          tryRot = (dx / dist) * roll;
          tlx = 0.5 - (dx / dist) * 0.44 * reach;
          tly = 0.38 - (dy / dist) * 0.38 * reach;
        }

        const stiffness = 0.2;
        const damping = 0.64;
        state.vx = state.vx * damping + (tx - state.x) * stiffness;
        state.vy = state.vy * damping + (ty - state.y) * stiffness;
        state.x += state.vx;
        state.y += state.vy;
        state.rvx = state.rvx * damping + (trx - state.rx) * stiffness;
        state.rvy = state.rvy * damping + (tryRot - state.ry) * stiffness;
        state.rx += state.rvx;
        state.ry += state.rvy;

        const lightEase = 0.2;
        state.lx += (tlx - state.lx) * lightEase;
        state.ly += (tly - state.ly) * lightEase;

        const targetScale = isHover ? 1.18 : 1;
        state.vs = (state.vs + (targetScale - state.scale) * 0.22) * 0.68;
        state.scale += state.vs;

        energy +=
          Math.abs(state.vx) +
          Math.abs(state.vy) +
          Math.abs(state.rvx) +
          Math.abs(state.rvy) +
          Math.abs(state.vs) +
          Math.abs(tx - state.x) +
          Math.abs(ty - state.y);

        const lift = Math.max(0, -state.y);
        const shadeScale = Math.max(0.42, 1 - lift / 24);
        orb.style.setProperty('--lx', state.lx.toFixed(3));
        orb.style.setProperty('--ly', state.ly.toFixed(3));
        orb.style.setProperty('--sx', (-state.x * 0.55).toFixed(2));
        orb.style.setProperty('--ss', shadeScale.toFixed(3));
        orb.style.setProperty('--so', (0.5 * shadeScale).toFixed(3));
        orb.dataset.active = isHover ? 'true' : 'false';
        ball.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0) rotateX(${state.rx.toFixed(2)}deg) rotateY(${state.ry.toFixed(2)}deg) scale(${state.scale.toFixed(3)})`;
      }

      const awake = pointer !== null || hover !== null || energy > 0.06;
      if (!awake) {
        frame = 0;
        return;
      }
      frame = window.requestAnimationFrame(step);
    };

    const kick = (): void => {
      if (!frame) frame = window.requestAnimationFrame(step);
    };

    const onMove = (event: PointerEvent): void => {
      pointer = { x: event.clientX, y: event.clientY };
      const node = event.target instanceof Element ? event.target.closest('.tech-orb') : null;
      hover = node instanceof HTMLElement ? node : null;
      kick();
    };

    const onLeave = (): void => {
      pointer = null;
      hover = null;
      kick();
    };

    kick();
    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave);

    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [rootRef]);
}
