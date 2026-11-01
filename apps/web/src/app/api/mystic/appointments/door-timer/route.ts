import { NextResponse } from 'next/server';
import {
  MysticAppointmentService,
  MysticStudioService,
  createSupabaseAdminClient,
} from '@template/api';
import { firstZodIssueMessage, mysticDoorTimerSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';
import { notifyDoorTimer } from '@/lib/mystic/notifications';

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticDoorTimerSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: existing } = await admin
      .from('mystic_appointments')
      .select('workspace_id, client_user_id')
      .eq('id', parsed.data.appointmentId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const forbidden = await requireStudioManager(auth.user, existing.workspace_id);
    if (forbidden) return forbidden;

    const settings =
      (await new MysticStudioService(admin).getSettings(existing.workspace_id)) ?? null;
    const minutes = settings?.door_timer_minutes ?? 15;
    const endsAt = new Date(Date.now() + minutes * 60_000).toISOString();

    const appointment = await new MysticAppointmentService(admin).startDoorTimer(
      parsed.data.appointmentId,
      endsAt
    );

    const { data: clientProfile } = await admin
      .from('mystic_client_profiles')
      .select('phone, marketing_sms')
      .eq('user_id', existing.client_user_id)
      .maybeSingle();

    if (clientProfile?.phone) {
      try {
        await notifyDoorTimer({
          phone: clientProfile.phone,
          minutes,
          smsOptIn: clientProfile.marketing_sms !== false,
        });
      } catch (err) {
        console.warn('[mystic.doorTimer] SMS failed', err);
      }
    }

    return NextResponse.json({ appointment, doorTimerMinutes: minutes });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.appointments.doorTimer');
  }
}
