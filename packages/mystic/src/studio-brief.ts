import { getServiceById, type ServiceId } from './catalog';
import { formatVisitWhen } from './visits';
import { isVisitLiveTracking } from './visits';
import { partitionStudioBoardAppointments } from './studio-board';

export type StudioBriefAppointment = {
  id: string;
  starts_at: string;
  service_id: string;
  status: string;
  client_user_id: string;
};

export type StudioRoadBrief = {
  /** Coined metric — Luke’s “stops” for the day. */
  stopsToday: number;
  stopsComingUp: number;
  liveCount: number;
  /** Short status for the hero number label. */
  metricLabel: string;
  /** One-line insight: what happened + what to do. */
  insight: string;
  /** Primary CTA copy. */
  primaryAction: 'calendar' | 'blocked' | 'refresh' | 'first_stop';
  primaryLabel: string;
  nextStop: {
    appointmentId: string;
    clientUserId: string;
    serviceName: string;
    whenLabel: string;
    live: boolean;
  } | null;
};

function serviceName(serviceId: string): string {
  try {
    return getServiceById(serviceId as ServiceId).name;
  } catch {
    return serviceId;
  }
}

/**
 * Daily ops brief for Luke’s Studio home — insight + next action, not just counts.
 */
export function buildStudioRoadBrief(
  appointments: StudioBriefAppointment[],
  clientNameById: Record<string, string | null | undefined>,
  now = new Date()
): StudioRoadBrief {
  const { today, upcoming } = partitionStudioBoardAppointments(appointments, now);
  const live = today.filter((a) => isVisitLiveTracking(a.status));
  const next = today[0] ?? upcoming[0] ?? null;

  const nextStop = next
    ? {
        appointmentId: next.id,
        clientUserId: next.client_user_id,
        serviceName: serviceName(next.service_id),
        whenLabel: formatVisitWhen(next.starts_at),
        live: isVisitLiveTracking(next.status),
      }
    : null;

  const nextName =
    (next && clientNameById[next.client_user_id]?.trim()) || (next ? 'Client' : null);

  if (live.length > 0 && nextStop) {
    return {
      stopsToday: today.length,
      stopsComingUp: upcoming.length,
      liveCount: live.length,
      metricLabel: live[0]!.status === 'door_timer_active' ? 'At the door' : 'On the road',
      insight:
        live[0]!.status === 'door_timer_active'
          ? `${nextName} — door timer is live. Stay until they answer or mark no-show.`
          : `${nextName} · ${nextStop.serviceName} — you’re en route. Share ETA if it slips.`,
      primaryAction: 'first_stop',
      primaryLabel: 'Open next stop',
      nextStop,
    };
  }

  if (today.length > 0 && nextStop) {
    const hour = now.getHours();
    const firstStart = new Date(today[0]!.starts_at);
    const minsUntil = Math.round((firstStart.getTime() - now.getTime()) / 60000);
    const timing =
      minsUntil > 90
        ? `First stop in about ${Math.round(minsUntil / 60)}h`
        : minsUntil > 0
          ? `First stop in ${minsUntil} min`
          : 'First stop is due';

    return {
      stopsToday: today.length,
      stopsComingUp: upcoming.length,
      liveCount: 0,
      metricLabel: today.length === 1 ? 'Stop today' : 'Stops today',
      insight: `${timing} · ${nextName} · ${nextStop.serviceName}. Prep kit + check inspo before you roll.`,
      primaryAction: 'first_stop',
      primaryLabel: hour < 12 ? 'Review first stop' : 'Open next stop',
      nextStop,
    };
  }

  if (upcoming.length > 0 && nextStop) {
    return {
      stopsToday: 0,
      stopsComingUp: upcoming.length,
      liveCount: 0,
      metricLabel: 'Clear today',
      insight: `Next is ${nextName} · ${nextStop.serviceName} · ${nextStop.whenLabel}. Block travel days if you need a break.`,
      primaryAction: 'calendar',
      primaryLabel: 'See the week',
      nextStop,
    };
  }

  return {
    stopsToday: 0,
    stopsComingUp: 0,
    liveCount: 0,
    metricLabel: 'Clear road',
    insight: 'No house calls this week — block a travel day if you’re heading out of town.',
    primaryAction: 'blocked',
    primaryLabel: 'Block a travel day',
    nextStop: null,
  };
}
