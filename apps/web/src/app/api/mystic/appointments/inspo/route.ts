import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { firstZodIssueMessage } from '@template/validation';
import type { User } from '@supabase/supabase-js';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';
const querySchema = z.object({ appointmentId: z.uuid() });

async function canAccessAppointmentPhotos(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  user: User,
  appointmentId: string
) {
  const { data: appt } = await admin
    .from('mystic_appointments')
    .select('client_user_id, workspace_id')
    .eq('id', appointmentId)
    .single();
  if (!appt) return { ok: false as const, status: 404 };
  if (appt.client_user_id === user.id) return { ok: true as const, appt };
  const forbidden = await requireStudioManager(user, appt.workspace_id);
  if (forbidden) return { ok: false as const, status: 403 };
  return { ok: true as const, appt };
}

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const appointmentId = new URL(req.url).searchParams.get('appointmentId');
    const parsed = querySchema.safeParse({ appointmentId });
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const access = await canAccessAppointmentPhotos(admin, auth.user, parsed.data.appointmentId);
    if (!access.ok) {
      return NextResponse.json(
        { error: access.status === 404 ? 'Not found' : 'Forbidden' },
        { status: access.status }
      );
    }

    const { data: photos, error } = await admin
      .from('mystic_appointment_photos')
      .select('id, public_url, storage_path, created_at')
      .eq('appointment_id', parsed.data.appointmentId)
      .order('created_at', { ascending: true });
    if (error) throw error;

    return NextResponse.json({ photos: photos ?? [] });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.appointments.inspo.list');
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const form = await req.formData();
    const appointmentId = form.get('appointmentId');
    const file = form.get('file');
    const parsed = querySchema.safeParse({ appointmentId });
    if (!parsed.success || !(file instanceof File)) {
      return NextResponse.json({ error: 'appointmentId and file required' }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: appt } = await admin
      .from('mystic_appointments')
      .select('client_user_id')
      .eq('id', parsed.data.appointmentId)
      .single();
    if (!appt || appt.client_user_id !== auth.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { count } = await admin
      .from('mystic_appointment_photos')
      .select('*', { count: 'exact', head: true })
      .eq('appointment_id', parsed.data.appointmentId);
    if ((count ?? 0) >= 4) {
      return NextResponse.json({ error: 'Maximum 4 inspo photos per visit' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const path = `${auth.user.id}/${parsed.data.appointmentId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('mystic-inspo')
      .upload(path, file, { upsert: false });
    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message, hint: 'Create Supabase bucket mystic-inspo (public read)' },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage.from('mystic-inspo').getPublicUrl(path);
    const { data: photo, error } = await admin
      .from('mystic_appointment_photos')
      .insert({
        appointment_id: parsed.data.appointmentId,
        storage_path: path,
        public_url: urlData.publicUrl,
      })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ photo });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.appointments.inspo');
  }
}
