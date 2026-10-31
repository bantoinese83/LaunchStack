import Constants from 'expo-constants';
import { createSupabaseMobileClient } from '@template/api/mobile';
import type { ServiceId } from '@template/mystic';
import type { AppointmentTagId } from '@template/mystic';

const appUrl = Constants.expoConfig?.extra?.appUrl ?? process.env.EXPO_PUBLIC_APP_URL ?? '';

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createSupabaseMobileClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchAvailability(date: string, serviceId: ServiceId) {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/availability?date=${date}&serviceId=${serviceId}`);
  return res.json();
}

export async function startBookingCheckout(payload: {
  serviceId: ServiceId;
  scheduledAt: string;
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    notes?: string;
  };
  distanceMiles: number;
  entitlement: 'none' | 'membership' | 'package';
  quoteCents: number;
  surchargeJson: { code: string; label: string; amountCents: number }[];
  tipCents?: number;
  tags?: AppointmentTagId[];
  referralCode?: string;
  policiesAccepted: boolean;
}) {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/checkout/booking`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, status: res.status, ...(await res.json()) };
}

export async function fetchMyAppointments() {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/appointments/mine`, {
    headers: await authHeaders(),
  });
  return res.json();
}

export async function fetchMyCredits() {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/credits/mine`, {
    headers: await authHeaders(),
  });
  return res.json();
}

export async function fetchMessageThread(workspaceId: string, clientUserId: string) {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(
    `${appUrl}/api/mystic/messages?workspaceId=${workspaceId}&clientUserId=${clientUserId}`,
    { headers: await authHeaders() }
  );
  return res.json();
}

export async function sendClientMessage(body: string, workspaceId: string) {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/messages`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ workspaceId, body }),
  });
  return res.json();
}

export async function startMembershipCheckout(membershipId: string) {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/checkout/membership`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ membershipId }),
  });
  return res.json();
}

export async function startPackageCheckout(packageId: string) {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/checkout/package`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ packageId }),
  });
  return res.json();
}

export async function fetchClientProfile() {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/client-profile`, {
    headers: await authHeaders(),
  });
  return res.json();
}

export async function saveClientProfile(body: Record<string, unknown>) {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/client-profile`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}
