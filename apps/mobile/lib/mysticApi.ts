import Constants from 'expo-constants';
import { createSupabaseMobileClient } from '@template/api/mobile';
import type { ServiceId, SurchargeRules } from '@template/mystic';
import type { AppointmentTagId } from '@template/mystic';

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

export async function fetchAvailability(date: string, serviceId: ServiceId) {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/availability?date=${date}&serviceId=${serviceId}`);
  return res.json();
}

export async function fetchGeocodedDistance(address: {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
}) {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/geocode/distance`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(address),
  });
  return res.json();
}

export async function fetchBookingSettings(): Promise<{
  rules?: SurchargeRules;
  depositCents?: number;
  winterBufferEnabled?: boolean;
}> {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/public/booking-settings`);
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
  referredByName?: string;
  referralCode?: string;
  clientNotes?: string;
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

export async function uploadInspoPhoto(appointmentId: string, uri: string, fileName: string) {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const form = new FormData();
  form.append('appointmentId', appointmentId);
  form.append('file', {
    uri,
    name: fileName,
    type: 'image/jpeg',
  } as unknown as Blob);

  const res = await fetch(`${appUrl}/api/mystic/appointments/inspo`, {
    method: 'POST',
    headers: await authHeaders(false),
    body: form,
  });
  return res.json();
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

export type ClientProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  birthday?: string;
  marketingSms: boolean;
  marketingEmail: boolean;
};

export type ClientProfileRow = {
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  birthday?: string | null;
  marketing_sms?: boolean;
  marketing_email?: boolean;
  referral_code?: string | null;
};

export type InspoPhotoRow = { id: string; public_url: string; created_at?: string };

export async function fetchClientProfile(): Promise<{
  profile?: ClientProfileRow;
  error?: string;
}> {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/client-profile`, {
    headers: await authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error ?? 'Could not load profile' };
  return data;
}

export async function uploadProfileAvatar(
  uri: string,
  fileName: string
): Promise<{ url?: string; error?: string }> {
  if (!appUrl) return { error: 'EXPO_PUBLIC_APP_URL not set' };
  const form = new FormData();
  form.append('file', {
    uri,
    name: fileName,
    type: 'image/jpeg',
  } as unknown as Blob);
  const res = await fetch(`${appUrl}/api/profile/avatar`, {
    method: 'POST',
    headers: await authHeaders(false),
    body: form,
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error ?? 'Upload failed' };
  return { url: data.url as string };
}

export async function fetchAppointmentInspo(appointmentId: string): Promise<{
  photos?: InspoPhotoRow[];
  error?: string;
}> {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(
    `${appUrl}/api/mystic/appointments/inspo?appointmentId=${encodeURIComponent(appointmentId)}`,
    { headers: await authHeaders() }
  );
  const data = await res.json();
  if (!res.ok) return { error: data.error };
  return data;
}

export async function saveClientProfile(body: ClientProfileForm): Promise<{
  ok: boolean;
  profile?: ClientProfileRow;
  error?: string;
}> {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/client-profile`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, error: data.error ?? 'Could not save' };
  return { ok: true, profile: data.profile };
}
