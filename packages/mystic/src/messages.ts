/** Suggested client taps — inserted into composer, not sent automatically. */
export const CLIENT_MESSAGE_QUICK_REPLIES = [
  'Running 5 min late',
  'Gate code is #',
  'Parking is street only',
  'Can we push 30 min?',
] as const;

export const STUDIO_MESSAGE_QUICK_REPLIES = [
  'On my way!',
  'Running a few minutes behind',
  'Outside — door timer started',
  'See you soon',
] as const;

export function formatMessageTimestamp(iso: string, nowMs = Date.now()): string {
  const d = new Date(iso);
  const diffSec = Math.round((nowMs - d.getTime()) / 1000);
  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.max(1, Math.floor(diffSec / 60))}m ago`;
  const today = new Date(nowMs);
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
  }
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function messageSenderLabel(role: string, mode: 'client' | 'studio'): string {
  if (mode === 'client') {
    return role === 'stylist' ? 'Luke' : 'You';
  }
  return role === 'stylist' ? 'You (Luke)' : 'Client';
}
