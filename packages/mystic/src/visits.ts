/** Client-facing copy for appointment rows (My visits). */
export const VISIT_STATUS_LABEL: Record<string, string> = {
  pending: 'Complete payment',
  stylist_en_route: 'Luke is on the way',
  door_timer_active: 'Luke is at your door',
  confirmed: 'Confirmed',
  completed: 'Completed',
  canceled: 'Canceled',
  no_show: 'No-show',
};

export function visitStatusLabel(status: string): string {
  return VISIT_STATUS_LABEL[status] ?? status.replace(/_/g, ' ');
}

/** Poll / highlight when location or door timer may change. */
export function isVisitLiveTracking(status: string): boolean {
  return status === 'stylist_en_route' || status === 'door_timer_active';
}

export function sortVisitsForDisplay<T extends { starts_at: string; status: string }>(
  rows: T[]
): T[] {
  const priority = (status: string) => {
    if (status === 'door_timer_active') return 0;
    if (status === 'stylist_en_route') return 1;
    if (status === 'confirmed') return 2;
    return 3;
  };
  return [...rows].sort((a, b) => {
    const byPriority = priority(a.status) - priority(b.status);
    if (byPriority !== 0) return byPriority;
    return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
  });
}

export function secondsUntil(isoEnd: string, nowMs = Date.now()): number {
  return Math.max(0, Math.ceil((new Date(isoEnd).getTime() - nowMs) / 1000));
}

export function formatCountdownMmSs(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Door timer turns urgent (red) inside this window. */
export const DOOR_TIMER_URGENT_SECONDS = 120;

/** Final stretch — the countdown copy gets more insistent. */
export const DOOR_TIMER_FINAL_SECONDS = 30;

export type DoorTimerTone = 'calm' | 'urgent' | 'final' | 'expired';

export function doorTimerTone(remainingSeconds: number): DoorTimerTone {
  if (remainingSeconds <= 0) return 'expired';
  if (remainingSeconds <= DOOR_TIMER_FINAL_SECONDS) return 'final';
  if (remainingSeconds <= DOOR_TIMER_URGENT_SECONDS) return 'urgent';
  return 'calm';
}

/**
 * Copy for a polite live region. The text is stable within a tone, so a screen
 * reader announces the door timer only when it crosses a threshold — never on
 * every one-second tick (which would make the countdown unusable with a
 * screen reader).
 */
export function doorTimerAnnouncement(remainingSeconds: number): string {
  switch (doorTimerTone(remainingSeconds)) {
    case 'expired':
      return 'Arrival window ended. Message Luke if you still need help.';
    case 'final':
      return 'Less than 30 seconds left — please answer the door.';
    case 'urgent':
      return 'About 2 minutes left — please answer the door.';
    default:
      return 'Luke is at your door — please answer when you can.';
  }
}

/** 0–1 elapsed fraction for the door-timer progress bar. */
export function doorTimerElapsedFraction(remainingSeconds: number, windowSeconds: number): number {
  if (!Number.isFinite(windowSeconds) || windowSeconds <= 0) return 1;
  const elapsed = (windowSeconds - remainingSeconds) / windowSeconds;
  return Math.min(1, Math.max(0, elapsed));
}

export function formatRelativeUpdatedAt(iso: string, nowMs = Date.now()): string {
  const diffSec = Math.round((nowMs - new Date(iso).getTime()) / 1000);
  if (diffSec < 0) return 'Just now';
  if (diffSec < 15) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function isLocationUpdateFresh(iso: string | null | undefined, maxAgeSec = 120): boolean {
  if (!iso) return false;
  const ageSec = (Date.now() - new Date(iso).getTime()) / 1000;
  return ageSec >= 0 && ageSec <= maxAgeSec;
}

export function formatVisitWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (d.toDateString() === now.toDateString()) return `Today · ${time}`;
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow · ${time}`;
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function canUploadVisitInspo(status: string): boolean {
  return status !== 'canceled' && status !== 'no_show' && status !== 'completed';
}

export type VisitStatusTone = 'live' | 'urgent' | 'active' | 'pending' | 'muted';

export function visitStatusTone(status: string): VisitStatusTone {
  if (status === 'door_timer_active') return 'urgent';
  if (status === 'stylist_en_route') return 'live';
  if (status === 'confirmed') return 'active';
  if (status === 'pending') return 'pending';
  return 'muted';
}

const TERMINAL_VISIT_STATUSES = new Set(['completed', 'canceled', 'no_show']);

export function partitionVisitsForTabs<T extends { starts_at: string; status: string }>(
  rows: T[]
): { upcoming: T[]; past: T[] } {
  const upcoming: T[] = [];
  const past: T[] = [];
  const now = Date.now();
  for (const row of rows) {
    if (TERMINAL_VISIT_STATUSES.has(row.status)) {
      past.push(row);
      continue;
    }
    if (isVisitLiveTracking(row.status)) {
      upcoming.push(row);
      continue;
    }
    if (new Date(row.starts_at).getTime() < now - 60 * 60 * 1000) {
      past.push(row);
    } else {
      upcoming.push(row);
    }
  }
  return {
    upcoming: sortVisitsForDisplay(upcoming),
    past: [...past].sort(
      (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
    ),
  };
}

/** Nearest actionable visit — live tracking first, then earliest upcoming. */
export function pickUpNextVisit<T extends { starts_at: string; status: string }>(
  upcoming: T[]
): T | null {
  if (!upcoming.length) return null;
  const live = upcoming.find((row) => isVisitLiveTracking(row.status));
  return live ?? upcoming[0] ?? null;
}

export function formatAddressLine(address: unknown): string | null {
  if (!address || typeof address !== 'object') return null;
  const a = address as {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  const line = [a.line1, [a.city, a.state].filter(Boolean).join(', '), a.postalCode]
    .filter(Boolean)
    .join(' · ');
  return line || null;
}
