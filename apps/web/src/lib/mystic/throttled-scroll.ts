/** Coalesce scroll/resize to one callback per animation frame. */

export function subscribeScrollResize(onChange: () => void): () => void {
  let raf = 0;
  const schedule = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(() => {
      raf = 0;
      onChange();
    });
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  return () => {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    if (raf) window.cancelAnimationFrame(raf);
  };
}
