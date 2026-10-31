'use client';

import { useEffect, useRef, useState } from 'react';
import { MYSTIC_MARKETING_IMAGES } from '@/lib/mystic/marketing-images';

/** Looping Pixabay background for sign-in pages (local auth-bg.mp4). */
export function MysticAuthBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [motionOk, setMotionOk] = useState(true);
  const [usePoster, setUsePoster] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const reduce = mq.matches;
      setMotionOk(!reduce);
      const el = videoRef.current;
      if (!el) return;
      if (reduce) el.pause();
      else void el.play().catch(() => setUsePoster(true));
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!motionOk || usePoster) return;
    const el = videoRef.current;
    if (!el) return;
    el.load();
    void el.play().catch(() => setUsePoster(true));
  }, [motionOk, usePoster]);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${MYSTIC_MARKETING_IMAGES.authPoster})` }}
      />
      {motionOk && !usePoster ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full scale-105 object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={MYSTIC_MARKETING_IMAGES.authPoster}
          onError={() => setUsePoster(true)}
        >
          <source src={MYSTIC_MARKETING_IMAGES.authVideo} type="video/mp4" />
        </video>
      ) : null}
      <div className="absolute inset-0 bg-shell/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-shell/25 via-shell/45 to-shell/72" />
    </div>
  );
}
