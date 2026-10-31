import { NextResponse } from 'next/server';
import { MysticAppointmentService, createSupabaseAdminClient } from '@template/api';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const admin = createSupabaseAdminClient();
    const appointments = await new MysticAppointmentService(admin).listForClient(auth.user.id);
    const ids = appointments.map((a) => a.id);
    const inspoByAppointment: Record<
      string,
      { id: string; public_url: string; created_at: string }[]
    > = {};
    if (ids.length) {
      const { data: photos } = await admin
        .from('mystic_appointment_photos')
        .select('id, appointment_id, public_url, created_at')
        .in('appointment_id', ids)
        .order('created_at', { ascending: true });
      for (const photo of photos ?? []) {
        const list = inspoByAppointment[photo.appointment_id] ?? [];
        list.push({
          id: photo.id,
          public_url: photo.public_url,
          created_at: photo.created_at,
        });
        inspoByAppointment[photo.appointment_id] = list;
      }
    }
    return NextResponse.json({
      appointments: appointments.map((a) => ({
        ...a,
        inspo_photos: inspoByAppointment[a.id] ?? [],
      })),
    });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.appointments.mine');
  }
}
