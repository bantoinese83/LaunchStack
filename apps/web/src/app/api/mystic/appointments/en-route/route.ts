import { NextResponse } from 'next/server';
import { MysticAppointmentService, createSupabaseAdminClient } from '@template/api';
import { firstZodIssueMessage, mysticEnRouteSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';
import { notifyEnRoute } from '@/lib/mystic/notifications';

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticEnRouteSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const existing = await admin
      .from('mystic_appointments')
      .select('workspace_id, client_user_id')
      .eq('id', parsed.data.appointmentId)
      .single();

    if (!existing.data) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const forbidden = await requireStudioManager(auth.user, existing.data.workspace_id);
    if (forbidden) return forbidden;

    const appointment = await new MysticAppointmentService(admin).markEnRoute(
      parsed.data.appointmentId,
      parsed.data.etaMinutes
    );

    const { data: clientProfile } = await admin
      .from('mystic_client_profiles')
      .select('phone, marketing_sms')
      .eq('user_id', existing.data.client_user_id)
      .maybeSingle();

    if (clientProfile?.phone) {
      try {
        await notifyEnRoute({ phone: clientProfile.phone, etaMinutes: parsed.data.etaMinutes });
      } catch {
        /* Twilio optional */
      }
    }

    return NextResponse.json({ appointment });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.appointments.enRoute');
  }
}
