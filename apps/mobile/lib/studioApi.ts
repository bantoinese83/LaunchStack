import Constants from 'expo-constants';
import { createSupabaseMobileClient } from '@template/api/mobile';

const appUrl = Constants.expoConfig?.extra?.appUrl ?? process.env.EXPO_PUBLIC_APP_URL ?? '';

async function authHeaders(json = true): Promise<HeadersInit> {
  const supabase = createSupabaseMobileClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function requireAppUrl() {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  return appUrl.replace(/\/$/, '');
}

export async function fetchStudioAccess(): Promise<{ allowed?: boolean; workspaceId?: string }> {
  const base = requireAppUrl();
  const res = await fetch(`${base}/api/mystic/studio/access`, {
    headers: await authHeaders(),
  });
  if (res.status === 401) return { allowed: false };
  return res.json();
}

export async function fetchStudioAppointments(workspaceId: string, from: string, to: string) {
  const base = requireAppUrl();
  const res = await fetch(
    `${base}/api/mystic/appointments?workspaceId=${encodeURIComponent(workspaceId)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { headers: await authHeaders() }
  );
  return res.json();
}

export async function studioPost(path: string, body: Record<string, unknown>) {
  const base = requireAppUrl();
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  return { ok: res.ok, ...(await res.json()) };
}

export async function studioPatchAppointment(
  workspaceId: string,
  appointmentId: string,
  action: 'cancel' | 'reschedule',
  startsAt?: string
) {
  const base = requireAppUrl();
  const res = await fetch(`${base}/api/mystic/appointments/manage`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify({ workspaceId, appointmentId, action, startsAt }),
  });
  return { ok: res.ok, ...(await res.json()) };
}

export async function fetchStudioClients(workspaceId: string) {
  const base = requireAppUrl();
  const res = await fetch(
    `${base}/api/mystic/clients?workspaceId=${encodeURIComponent(workspaceId)}`,
    { headers: await authHeaders() }
  );
  return res.json();
}

export async function fetchStudioThread(workspaceId: string, clientUserId: string) {
  const base = requireAppUrl();
  const res = await fetch(
    `${base}/api/mystic/messages?workspaceId=${encodeURIComponent(workspaceId)}&clientUserId=${encodeURIComponent(clientUserId)}`,
    { headers: await authHeaders() }
  );
  return res.json();
}

export async function sendStudioMessage(workspaceId: string, clientUserId: string, body: string) {
  const base = requireAppUrl();
  const res = await fetch(`${base}/api/mystic/messages`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ workspaceId, clientUserId, body }),
  });
  return res.json();
}

export async function fetchStudioAnalytics(workspaceId: string) {
  const base = requireAppUrl();
  const res = await fetch(
    `${base}/api/mystic/analytics/summary?workspaceId=${encodeURIComponent(workspaceId)}`,
    { headers: await authHeaders() }
  );
  return res.json();
}

export async function fetchStudioSettings(workspaceId: string) {
  const base = requireAppUrl();
  const res = await fetch(
    `${base}/api/mystic/studio/settings?workspaceId=${encodeURIComponent(workspaceId)}`,
    { headers: await authHeaders() }
  );
  return res.json();
}

export async function patchStudioSettings(workspaceId: string, patch: Record<string, unknown>) {
  const base = requireAppUrl();
  const res = await fetch(`${base}/api/mystic/studio/settings`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify({ workspaceId, ...patch }),
  });
  return res.json();
}

export async function sendStudioBlast(body: {
  workspaceId: string;
  channel: 'email' | 'sms' | 'both';
  segment: 'all' | 'members' | 'packages' | 'upcoming_week';
  subject?: string;
  body: string;
}) {
  const base = requireAppUrl();
  const res = await fetch(`${base}/api/mystic/blasts`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function shareStylistLocation(
  appointmentId: string,
  latitude: number,
  longitude: number
) {
  return studioPost('/api/mystic/appointments/share-location', {
    appointmentId,
    latitude,
    longitude,
  });
}

export async function fetchBlockedDates(workspaceId: string) {
  const base = requireAppUrl();
  const res = await fetch(
    `${base}/api/mystic/blocked-dates?workspaceId=${encodeURIComponent(workspaceId)}`,
    { headers: await authHeaders() }
  );
  return res.json();
}

export async function addBlockedDate(workspaceId: string, blockDate: string, reason?: string) {
  const base = requireAppUrl();
  const res = await fetch(`${base}/api/mystic/blocked-dates`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ workspaceId, blockDate, reason }),
  });
  return res.json();
}

export async function removeBlockedDate(workspaceId: string, id: string) {
  const base = requireAppUrl();
  const res = await fetch(`${base}/api/mystic/blocked-dates`, {
    method: 'DELETE',
    headers: await authHeaders(),
    body: JSON.stringify({ workspaceId, id }),
  });
  return res.json();
}

export async function fetchReferralDashboard(workspaceId: string, month: string) {
  const base = requireAppUrl();
  const res = await fetch(
    `${base}/api/mystic/referrals?workspaceId=${encodeURIComponent(workspaceId)}&view=dashboard&month=${month}`,
    { headers: await authHeaders() }
  );
  return res.json();
}
