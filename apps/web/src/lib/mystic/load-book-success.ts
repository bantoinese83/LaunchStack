import { createSupabaseAdminClient } from '@template/api';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';

export type BookSuccessAppointment = {
  id: string;
  serviceId: string;
  startsAt: string;
  durationMinutes: number;
  addressLine: string;
};

function formatAddressLine(address: unknown): string {
  if (!address || typeof address !== 'object') return 'Chicago, IL';
  const a = address as Record<string, unknown>;
  const line1 = typeof a.line1 === 'string' ? a.line1 : '';
  const city = typeof a.city === 'string' ? a.city : 'Chicago';
  const state = typeof a.state === 'string' ? a.state : 'IL';
  if (line1) return `${line1}, ${city}, ${state}`;
  return `${city}, ${state}`;
}

async function loadAppointmentForUser(
  appointmentId: string,
  userId: string
): Promise<BookSuccessAppointment | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('mystic_appointments')
    .select('id, service_id, starts_at, duration_minutes, address, client_user_id')
    .eq('id', appointmentId)
    .maybeSingle();

  if (!data || data.client_user_id !== userId) return null;

  return {
    id: data.id,
    serviceId: data.service_id,
    startsAt: data.starts_at,
    durationMinutes: data.duration_minutes,
    addressLine: formatAddressLine(data.address),
  };
}

async function resolveAppointmentIdFromStripeSession(sessionId: string): Promise<string | null> {
  try {
    const stripe = getStripeClient({ allowDevMock: true });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session.metadata?.appointment_id ?? null;
  } catch {
    return null;
  }
}

/** Loads appointment details for the signed-in client (post-checkout success). */
export async function loadBookSuccessAppointment(input: {
  appointmentId?: string;
  sessionId?: string;
}): Promise<BookSuccessAppointment | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let appointmentId = input.appointmentId?.trim() || null;
  if (!appointmentId && input.sessionId) {
    appointmentId = await resolveAppointmentIdFromStripeSession(input.sessionId);
  }
  if (!appointmentId) return null;

  return loadAppointmentForUser(appointmentId, user.id);
}
