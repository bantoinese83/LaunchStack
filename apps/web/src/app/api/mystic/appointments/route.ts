import { NextResponse } from 'next/server';
import { MysticAppointmentService, createSupabaseAdminClient } from '@template/api';
import { firstZodIssueMessage, mysticWorkspaceIdSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';
import { z } from 'zod';

const listSchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
  from: z.iso.datetime(),
  to: z.iso.datetime(),
});

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const params = Object.fromEntries(new URL(req.url).searchParams);
    const parsed = listSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const admin = createSupabaseAdminClient();
    const appointments = await new MysticAppointmentService(admin).listForStudio(
      parsed.data.workspaceId,
      parsed.data.from,
      parsed.data.to
    );
    return NextResponse.json({ appointments });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.appointments.list');
  }
}

/** Bookings must use POST /api/mystic/checkout/booking (quote + payment verification). */
export async function POST() {
  return NextResponse.json(
    { error: 'Use POST /api/mystic/checkout/booking to book a house call' },
    { status: 405 }
  );
}
