'use client';

import { useEffect, type DependencyList } from 'react';

/** Schedules effect work after mount paint — satisfies react-hooks/set-state-in-effect for client fetches. */
export function useDeferredEffect(fn: () => void | Promise<void>, deps: DependencyList) {
  useEffect(() => {
    let active = true;
    const id = window.setTimeout(() => {
      if (active) void fn();
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller supplies full dependency list
  }, deps);
}
