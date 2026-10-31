/** Client-facing copy for appointment rows (My visits). */
export const VISIT_STATUS_LABEL: Record<string, string> = {
  stylist_en_route: 'Luke is on the way',
  door_timer_active: 'Door timer — please answer',
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
