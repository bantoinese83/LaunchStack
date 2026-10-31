import { NextResponse } from 'next/server';
import { MysticAppointmentService, createSupabaseAdminClient } from '@template/api';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

/** Cancel unpaid pending holds when client leaves Stripe checkout. */
export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const workspaceId = getMysticWorkspaceId();
    const admin = createSupabaseAdminClient();
    await new MysticAppointmentService(admin).cancelPendingForClient(workspaceId, auth.user.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.appointments.release-checkout');
  }
}
