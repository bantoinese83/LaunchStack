import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { DEFAULT_SURCHARGE_RULES } from '@template/mystic';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  firstZodIssueMessage,
  mysticInspoBatchSchema,
  mysticInspoUploadSchema,
} from '@template/validation';
import type { User } from '@supabase/supabase-js';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE = /^image\//;

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

async function canAccessAppointmentPhotos(admin: AdminClient, user: User, appointmentId: string) {
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

/**
 * Photos for many appointments in two queries (appointments + photos) plus one
 * membership check per distinct workspace — instead of 2–3 queries per visit.
 */
async function listPhotosForAppointments(admin: AdminClient, user: User, ids: string[]) {
  const { data: appointments } = await admin
    .from('mystic_appointments')
    .select('id, client_user_id, workspace_id')
    .in('id', ids);

  const byId = new Map((appointments ?? []).map((a) => [a.id, a]));
  if (byId.size !== ids.length) return { ok: false as const, status: 404, error: 'Not found' };

  const studioAccess = new Map<string, boolean>();
  for (const id of ids) {
    const appt = byId.get(id);
    if (!appt) return { ok: false as const, status: 404, error: 'Not found' };
    if (appt.client_user_id === user.id) continue;
    let allowed = studioAccess.get(appt.workspace_id);
    if (allowed === undefined) {
      allowed = (await requireStudioManager(user, appt.workspace_id)) === null;
      studioAccess.set(appt.workspace_id, allowed);
    }
    if (!allowed) return { ok: false as const, status: 403, error: 'Forbidden' };
  }

  const { data: photos, error } = await admin
    .from('mystic_appointment_photos')
    .select('id, appointment_id, public_url, storage_path, created_at')
    .in('appointment_id', ids)
    .order('created_at', { ascending: true });
  if (error) throw error;

  const photosByAppointment: Record<string, unknown[]> = {};
  for (const id of ids) photosByAppointment[id] = [];
  for (const photo of photos ?? []) {
    const list = photosByAppointment[photo.appointment_id];
    if (list) list.push(photo);
    else photosByAppointment[photo.appointment_id] = [photo];
  }

  return { ok: true as const, photosByAppointment };
}

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const url = new URL(req.url);
    const admin = createSupabaseAdminClient();

    // Batch mode: the studio board asks for every visit in one request.
    const batchParam = url.searchParams.get('appointmentIds');
    if (batchParam !== null) {
      const ids = [
        ...new Set(
          batchParam
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        ),
      ];
      const parsed = mysticInspoBatchSchema.safeParse({ appointmentIds: ids });
      if (!parsed.success) {
        return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
      }
      const result = await listPhotosForAppointments(admin, auth.user, parsed.data.appointmentIds);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json({ photosByAppointment: result.photosByAppointment });
    }

    const appointmentId = url.searchParams.get('appointmentId');
    const parsed = mysticInspoUploadSchema.safeParse({ appointmentId });
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

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
    const parsed = mysticInspoUploadSchema.safeParse({ appointmentId });
    if (!parsed.success || !(file instanceof File)) {
      return NextResponse.json({ error: 'appointmentId and image file required' }, { status: 400 });
    }
    if (!ALLOWED_IMAGE.test(file.type || '')) {
      return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 415 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be 5MB or smaller' }, { status: 413 });
    }

    const maxPhotos = DEFAULT_SURCHARGE_RULES.maxInspoPhotos;
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
    if ((count ?? 0) >= maxPhotos) {
      return NextResponse.json(
        { error: `Maximum ${maxPhotos} inspo photos per visit` },
        { status: 400 }
      );
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
    const { count: countBeforeInsert } = await admin
      .from('mystic_appointment_photos')
      .select('*', { count: 'exact', head: true })
      .eq('appointment_id', parsed.data.appointmentId);
    if ((countBeforeInsert ?? 0) >= maxPhotos) {
      await supabase.storage.from('mystic-inspo').remove([path]);
      return NextResponse.json(
        { error: `Maximum ${maxPhotos} inspo photos per visit` },
        { status: 400 }
      );
    }

    const { data: photo, error } = await admin
      .from('mystic_appointment_photos')
      .insert({
        appointment_id: parsed.data.appointmentId,
        storage_path: path,
        public_url: urlData.publicUrl,
      })
      .select('*')
      .single();
    if (error) {
      if (error.code === '23514' || /inspo photos per visit/i.test(error.message ?? '')) {
        await supabase.storage.from('mystic-inspo').remove([path]);
        return NextResponse.json(
          { error: `Maximum ${maxPhotos} inspo photos per visit` },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ photo });
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (/inspo photos per visit/i.test(message)) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return routeErrorResponse(err, 'mystic.appointments.inspo');
  }
}
