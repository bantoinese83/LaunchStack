/** Pause canvas rAF when off-screen or tab hidden; optional FPS cap (same visuals, less work). */

export type ManagedCanvasLoopOptions = {
  /** IntersectionObserver rootMargin — start slightly before enter. */
  rootMargin?: string;
  /** Max frames per second while active (default 60). */
  maxFps?: number;
};

export function getMarketingCanvasDpr(max = 2) {
  if (typeof window === 'undefined') return 1;
  const raw = window.devicePixelRatio || 1;
  const narrow = window.matchMedia('(max-width: 768px)').matches;
  const cap = narrow ? Math.min(max, 1.35) : max;
  return Math.min(raw, cap);
}

export function subscribeManagedCanvasLoop(
  element: HTMLElement,
  onFrame: (timeMs: number) => void,
  options: ManagedCanvasLoopOptions = {}
): () => void {
  const { rootMargin = '120px 0px', maxFps = 60 } = options;
  const minFrameMs = 1000 / maxFps;

  let raf = 0;
  let active = false;
  let docVisible = typeof document === 'undefined' ? true : document.visibilityState === 'visible';
  let lastFrameMs = 0;

  const tick = (timeMs: number) => {
    raf = 0;
    if (!active || !docVisible) return;
    if (timeMs - lastFrameMs < minFrameMs) {
      schedule();
      return;
    }
    lastFrameMs = timeMs;
    onFrame(timeMs);
    schedule();
  };

  const schedule = () => {
    if (raf || !active || !docVisible) return;
    raf = window.requestAnimationFrame(tick);
  };

  const setActive = (next: boolean) => {
    if (active === next) return;
    active = next;
    if (active && docVisible) schedule();
    else if (raf) {
      window.cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      setActive(Boolean(entry?.isIntersecting));
    },
    { rootMargin, threshold: 0 }
  );
  io.observe(element);

  const onVisibility = () => {
    docVisible = document.visibilityState === 'visible';
    if (docVisible && active) schedule();
    else if (raf) {
      window.cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    if (raf) window.cancelAnimationFrame(raf);
  };
}
