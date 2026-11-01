'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MYSTIC_MARKETING_IMAGES } from '@/lib/mystic/marketing-images';
import { cn } from '@/lib/utils';

/** Looping Pixabay background for sign-in pages (local auth-bg.mp4). */
export function MysticAuthBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [motionOk, setMotionOk] = useState(true);
  /** True once the video is actually advancing — hides the poster plate. */
  const [videoLive, setVideoLive] = useState(false);
  /** Hard fallback only when the file fails to decode/load. */
  const [mediaBroken, setMediaBroken] = useState(false);

  const tryPlay = useCallback(async () => {
    const el = videoRef.current;
    if (!el || mediaBroken) return;
    try {
      el.muted = true;
      await el.play();
    } catch {
      /* Autoplay can be deferred; keep poster until onPlaying / timeupdate. */
    }
  }, [mediaBroken]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const reduce = mq.matches;
      setMotionOk(!reduce);
      const el = videoRef.current;
      if (!el) return;
      if (reduce) {
        el.pause();
        setVideoLive(false);
      } else {
        void tryPlay();
      }
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [tryPlay]);

  useEffect(() => {
    if (!motionOk || mediaBroken) return;
    void tryPlay();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void tryPlay();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [motionOk, mediaBroken, tryPlay]);

  const showVideo = motionOk && !mediaBroken;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className={cn(
          'absolute inset-0 bg-cover bg-center transition-opacity duration-700',
          showVideo && videoLive ? 'opacity-0' : 'opacity-100'
        )}
        style={{ backgroundImage: `url(${MYSTIC_MARKETING_IMAGES.authPoster})` }}
      />
      {showVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full scale-105 object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={MYSTIC_MARKETING_IMAGES.authPoster}
          onLoadedData={() => void tryPlay()}
          onCanPlay={() => void tryPlay()}
          onPlaying={() => setVideoLive(true)}
          onTimeUpdate={(e) => {
            if (e.currentTarget.currentTime > 0.05) setVideoLive(true);
          }}
          onError={() => setMediaBroken(true)}
        >
          <source src={MYSTIC_MARKETING_IMAGES.authVideo} type="video/mp4" />
        </video>
      ) : null}
      <div className="absolute inset-0 bg-shell/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-shell/25 via-shell/45 to-shell/72" />
    </div>
  );
}
