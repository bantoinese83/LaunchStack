import { isVisitLiveTracking } from './visits';

/** Start/end of local calendar day as ISO (device timezone — Luke runs Chicago). */
export function studioTodayRangeIso(now = new Date()) {
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

/** Today through the next 7 days for Luke's mobile/web ops board. */
export function studioWeekBoardRangeIso(now = new Date()) {
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  const to = new Date(now);
  to.setDate(to.getDate() + 7);
  to.setHours(23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

/**
 * Max appointment ids the batched inspo endpoint accepts per request. Keeps the
 * query string short enough for proxy URL limits.
 */
export const MYSTIC_INSPO_BATCH_MAX = 50;

/** Split ids into request-sized batches so batched reads stay inside URL limits. */
export function chunkIds<T>(ids: readonly T[], size = MYSTIC_INSPO_BATCH_MAX): T[][] {
  if (size < 1) return ids.length ? [ids.slice()] : [];
  const batches: T[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    batches.push(ids.slice(i, i + size));
  }
  return batches;
}

const BOARD_SKIP = new Set(['canceled']);

export function partitionStudioBoardAppointments<
  T extends { id?: string; starts_at: string; status: string },
>(rows: T[], now = new Date()): { today: T[]; upcoming: T[] } {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const startMs = startOfToday.getTime();
  const endMs = endOfToday.getTime();

  const today: T[] = [];
  const upcoming: T[] = [];
  const todayKeys = new Set<string>();

  const key = (row: T) => row.id ?? row.starts_at;
  const addToday = (row: T) => {
    const k = key(row);
    if (todayKeys.has(k)) return;
    todayKeys.add(k);
    today.push(row);
  };

  for (const row of rows) {
    if (BOARD_SKIP.has(row.status)) continue;
    const when = new Date(row.starts_at).getTime();
    if (isVisitLiveTracking(row.status)) {
      addToday(row);
      continue;
    }
    if (when >= startMs && when <= endMs) {
      addToday(row);
    } else if (when > endMs) {
      upcoming.push(row);
    }
  }

  const byTime = (a: T, b: T) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
  today.sort(byTime);
  upcoming.sort(byTime);
  return { today, upcoming };
}
