import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { z } from 'zod';
import { firstZodIssueMessage } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';
import { captureAppointmentDeposit } from '@/lib/mystic/capture-deposit';

const schema = z.object({ appointmentId: z.uuid() });

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: row } = await admin
      .from('mystic_appointments')
      .select('workspace_id, stripe_payment_intent_id, deposit_cents')
      .eq('id', parsed.data.appointmentId)
      .single();

    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const forbidden = await requireStudioManager(auth.user, row.workspace_id);
    if (forbidden) return forbidden;

    await captureAppointmentDeposit(admin, parsed.data.appointmentId);
    const { data: appointment } = await admin
      .from('mystic_appointments')
      .select('*')
      .eq('id', parsed.data.appointmentId)
      .single();

    return NextResponse.json({ appointment });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.appointments.noShow');
  }
}
