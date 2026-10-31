import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { firstZodIssueMessage } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';

const querySchema = z.object({ appointmentId: z.uuid() });

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
