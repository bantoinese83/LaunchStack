import Constants from 'expo-constants';
import { createSupabaseMobileClient } from '@template/api/mobile';
import type { ServiceId, SurchargeRules } from '@template/mystic';
import type { AppointmentTagId } from '@template/mystic';
import { fetchMysticJson } from './fetchMysticJson';

const appUrl = (
  process.env.EXPO_PUBLIC_APP_URL ??
  Constants.expoConfig?.extra?.appUrl ??
  ''
).replace(/\/$/, '');

export function isMysticApiConfigured() {
  return Boolean(appUrl?.trim());
}

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
  const { ok, status, data } = await fetchMysticJson<{
    slots?: string[];
    blocked?: boolean;
    error?: string;
  }>(`${appUrl}/api/mystic/availability?date=${date}&serviceId=${serviceId}`);
  if (!ok) return { slots: [], error: data.error ?? `Availability failed (${status})` };
  return data;
}

export async function fetchGeocodedDistance(address: {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
}) {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const { ok, status, data } = await fetchMysticJson<{
    distanceMiles?: number;
    latitude?: number;
    longitude?: number;
    error?: string;
  }>(`${appUrl}/api/mystic/geocode/distance`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(address),
  });
  if (!ok) return { error: data.error ?? `Geocode failed (${status})` };
  return data;
}

export async function fetchAddressAutocomplete(q: string): Promise<{
  suggestions?: import('@template/mystic').AddressSuggestion[];
  error?: string;
}> {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/geocode/autocomplete?q=${encodeURIComponent(q)}`, {
    headers: await authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error ?? 'Lookup failed' };
  return data;
}

export async function fetchBookingSettings(): Promise<{
  rules?: SurchargeRules;
  depositCents?: number;
  winterBufferEnabled?: boolean;
  error?: string;
}> {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const { ok, data } = await fetchMysticJson<{
    rules?: SurchargeRules;
    depositCents?: number;
    winterBufferEnabled?: boolean;
    error?: string;
  }>(`${appUrl}/api/mystic/public/booking-settings`);
  if (!ok) return { error: data.error ?? 'Could not load booking settings' };
  return data;
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
    latitude?: number;
    longitude?: number;
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
  idempotencyKey?: string;
  useMobileCancelDeepLink?: boolean;
}) {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const headers = await authHeaders();
  if (payload.idempotencyKey) {
    (headers as Record<string, string>)['Idempotency-Key'] = payload.idempotencyKey;
  }
  const res = await fetch(`${appUrl}/api/mystic/checkout/booking`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, status: res.status, ...(await res.json()) };
}

export async function releaseBookingCheckout(): Promise<{ ok: boolean; error?: string }> {
  if (!appUrl) return { ok: false, error: 'EXPO_PUBLIC_APP_URL not set' };
  const { ok, data } = await fetchMysticJson<{ ok?: boolean; error?: string }>(
    `${appUrl}/api/mystic/appointments/release-checkout`,
    { method: 'POST', headers: await authHeaders() }
  );
  if (!ok) return { ok: false, error: data.error ?? 'Could not release checkout hold' };
  return { ok: true };
}

export async function uploadInspoPhoto(
  appointmentId: string,
  uri: string,
  fileName: string,
  mimeType = 'image/jpeg'
) {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const form = new FormData();
  form.append('appointmentId', appointmentId);
  form.append('file', {
    uri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  const { ok, status, data } = await fetchMysticJson<{ photo?: unknown; error?: string }>(
    `${appUrl}/api/mystic/appointments/inspo`,
    {
      method: 'POST',
      headers: await authHeaders(false),
      body: form,
    }
  );
  return { ok, status, ...data };
}

export async function fetchMyAppointments() {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const { ok, status, data } = await fetchMysticJson<{
    appointments?: unknown[];
    error?: string;
  }>(`${appUrl}/api/mystic/appointments/mine`, {
    headers: await authHeaders(),
  });
  return { ok, status, ...data };
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
  const { ok, status, data } = await fetchMysticJson<{
    messages?: unknown[];
    error?: string;
  }>(`${appUrl}/api/mystic/messages?workspaceId=${workspaceId}&clientUserId=${clientUserId}`, {
    headers: await authHeaders(),
  });
  return { ok, status, ...data };
}

export async function sendClientMessage(body: string, workspaceId: string) {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const { ok, status, data } = await fetchMysticJson<{ message?: unknown; error?: string }>(
    `${appUrl}/api/mystic/messages`,
    {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ workspaceId, body: body.trim() }),
    }
  );
  return { ok, status, ...data };
}

export async function startMembershipCheckout(membershipId: string) {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/checkout/membership`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ membershipId, useMobileReturnDeepLink: true }),
  });
  return res.json();
}

export async function startPackageCheckout(packageId: string) {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/checkout/package`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ packageId, useMobileReturnDeepLink: true }),
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

export type ReferralProgress = {
  pending: number;
  threshold: number;
  towardNext: number;
  untilReward: number;
  copy: string;
};

export type InspoPhotoRow = { id: string; public_url: string; created_at?: string };

export async function fetchClientProfile(): Promise<{
  profile?: ClientProfileRow;
  referralProgress?: ReferralProgress;
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

export async function saveDiceBearAvatar(
  style: string,
  seed: string
): Promise<{ url?: string; error?: string }> {
  if (!appUrl) return { error: 'EXPO_PUBLIC_APP_URL not set' };
  const res = await fetch(`${appUrl}/api/profile/avatar`, {
    method: 'PUT',
    headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify({ style, seed }),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error ?? 'Could not save avatar' };
  return { url: data.url as string };
}

export async function uploadProfileAvatar(
  uri: string,
  fileName: string,
  mimeType = 'image/jpeg'
): Promise<{ url?: string; error?: string }> {
  if (!appUrl) return { error: 'EXPO_PUBLIC_APP_URL not set' };
  const form = new FormData();
  form.append('file', {
    uri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);
  try {
    const res = await fetch(`${appUrl}/api/profile/avatar`, {
      method: 'POST',
      headers: await authHeaders(false),
      body: form,
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) return { error: data.error ?? 'Upload failed' };
    return { url: data.url };
  } catch {
    return { error: 'Network error — could not upload photo' };
  }
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

export async function askBookingConcierge(prompt: string): Promise<{
  serviceId?: ServiceId;
  serviceName?: string;
  reason?: string;
  tip?: string;
  confidence?: 'high' | 'medium' | 'low';
  clarifyingQuestion?: string;
  alternatives?: { serviceId: ServiceId; serviceName?: string; why: string }[];
  suggestedTags?: string[];
  error?: string;
}> {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const res = await fetch(`${appUrl}/api/mystic/ai/booking-concierge`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error ?? 'Could not recommend a service' };
  return data;
}
