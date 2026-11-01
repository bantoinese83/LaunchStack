'use client';

import { useEffect, useState } from 'react';
import {
  DOOR_TIMER_URGENT_SECONDS,
  doorTimerAnnouncement,
  doorTimerElapsedFraction,
  formatCountdownMmSs,
  secondsUntil,
} from '@template/mystic';

type DoorTimerClock = {
  /** Timestamp of the last tick — the countdown is derived from it. */
  nowMs: number;
  /** Which timer this window belongs to, so a new timer restarts the bar. */
  endsAt: string;
  /** Remaining seconds when this timer first rendered. */
  windowSeconds: number;
};

function initialClock(endsAt: string): DoorTimerClock {
  return { nowMs: Date.now(), endsAt, windowSeconds: secondsUntil(endsAt) };
}

export function MysticDoorTimerBanner({ endsAt }: { endsAt: string }) {
  const [clock, setClock] = useState(() => initialClock(endsAt));

  // A new door timer restarts the progress window (adjust state during render).
  if (clock.endsAt !== endsAt) {
    setClock(initialClock(endsAt));
  }

  useEffect(() => {
    const id = setInterval(() => {
      setClock((prev) => ({ ...prev, nowMs: Date.now() }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = secondsUntil(endsAt, clock.nowMs);
  const windowSeconds =
    clock.endsAt === endsAt ? clock.windowSeconds : secondsUntil(endsAt, clock.nowMs);
  const expired = remaining <= 0;
  const urgent = !expired && remaining <= DOOR_TIMER_URGENT_SECONDS;
  const elapsed = doorTimerElapsedFraction(remaining, windowSeconds);

  return (
    <div
      className={`mt-3 rounded-xl border px-3 py-2 ${
        expired
          ? 'border-danger/40 bg-danger/10'
          : urgent
            ? 'border-danger/50 bg-danger/10'
            : 'border-accent/30 bg-accent/5'
      }`}
    >
      {expired ? (
        <p className="text-sm text-danger">Luke has left — message him if you still need help.</p>
      ) : (
        <>
          <p className={`text-sm font-medium ${urgent ? 'text-danger' : 'text-chalk'}`}>
            Answer the door — {formatCountdownMmSs(remaining)} left
          </p>
          <div
            className="mystic-progress-track mt-2"
            role="progressbar"
            aria-label="Time left to answer the door"
            aria-valuemin={0}
            aria-valuemax={windowSeconds}
            aria-valuenow={remaining}
            aria-valuetext={`${formatCountdownMmSs(remaining)} left`}
          >
            <div
              className={`mystic-progress-fill${urgent ? ' mystic-progress-fill--danger' : ''}`}
              style={{ width: `${Math.round(elapsed * 100)}%` }}
            />
          </div>
          <p className="mt-0.5 text-xs text-muted">
            Luke is waiting. Text in Messages if you need a moment.
          </p>
        </>
      )}
      {/*
        The visible countdown ticks every second, so it is deliberately NOT a live
        region. This persistent polite region only changes copy when the timer
        crosses a threshold — screen readers hear the countdown at 2:00, 0:30 and
        when it ends, instead of once per second.
      */}
      <p role="status" className="sr-only">
        {doorTimerAnnouncement(remaining)}
      </p>
    </div>
  );
}
