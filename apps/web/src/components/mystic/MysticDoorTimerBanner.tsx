'use client';

import { useEffect, useState } from 'react';
import { formatCountdownMmSs, secondsUntil } from '@template/mystic';

export function MysticDoorTimerBanner({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState(() => secondsUntil(endsAt));

  useEffect(() => {
    setRemaining(secondsUntil(endsAt));
    const id = setInterval(() => {
      setRemaining(secondsUntil(endsAt));
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (remaining <= 0) {
    return (
      <p className="mt-3 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
        Door timer ended — message Luke if you still need help.
      </p>
    );
  }

  const urgent = remaining <= 120;

  return (
    <div
      className={`mt-3 rounded-xl border px-3 py-2 ${
        urgent ? 'border-danger/50 bg-danger/10' : 'border-accent/30 bg-accent/5'
      }`}
      role="timer"
      aria-live="polite"
    >
      <p className={`text-sm font-medium ${urgent ? 'text-danger' : 'text-chalk'}`}>
        Answer the door — {formatCountdownMmSs(remaining)} left
      </p>
      <p className="mt-0.5 text-xs text-muted">
        Luke is waiting. Text in Messages if you need a moment.
      </p>
    </div>
  );
}
