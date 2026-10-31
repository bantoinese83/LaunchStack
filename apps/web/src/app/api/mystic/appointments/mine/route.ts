import { NextResponse } from 'next/server';
import { MysticAppointmentService, createSupabaseAdminClient } from '@template/api';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const admin = createSupabaseAdminClient();
    const appointments = await new MysticAppointmentService(admin).listForClient(auth.user.id);
    return NextResponse.json({ appointments });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.appointments.mine');
  }
}
