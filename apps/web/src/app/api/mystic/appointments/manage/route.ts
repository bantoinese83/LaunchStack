import { NextResponse } from 'next/server';
import { MysticAppointmentService, createSupabaseAdminClient } from '@template/api';
import { firstZodIssueMessage, mysticStudioAppointmentPatchSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';

export async function PATCH(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticStudioAppointmentPatchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const admin = createSupabaseAdminClient();
    const { data: existing } = await admin
      .from('mystic_appointments')
      .select('workspace_id, status')
      .eq('id', parsed.data.appointmentId)
      .single();

    if (!existing || existing.workspace_id !== parsed.data.workspaceId) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (existing.status === 'canceled' || existing.status === 'completed') {
      return NextResponse.json({ error: 'Appointment cannot be changed' }, { status: 400 });
    }

    const service = new MysticAppointmentService(admin);
    const appointment =
      parsed.data.action === 'cancel'
        ? await service.cancel(parsed.data.appointmentId)
        : await service.reschedule(parsed.data.appointmentId, parsed.data.startsAt!);

    return NextResponse.json({ appointment });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.appointments.manage');
  }
}
