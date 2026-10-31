import { NextResponse } from 'next/server';
import { MysticAppointmentService, createSupabaseAdminClient } from '@template/api';
import { firstZodIssueMessage, mysticShareLocationSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';

/** Update Luke's live GPS pin while en route (mobile studio). */
export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticShareLocationSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: existing } = await admin
      .from('mystic_appointments')
      .select('workspace_id, status')
      .eq('id', parsed.data.appointmentId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const forbidden = await requireStudioManager(auth.user, existing.workspace_id);
    if (forbidden) return forbidden;

    const appointment = await new MysticAppointmentService(admin).updateStylistLocation(
      parsed.data.appointmentId,
      parsed.data.latitude,
      parsed.data.longitude
    );

    return NextResponse.json({ appointment });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.appointments.shareLocation');
  }
}
