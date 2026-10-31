import { NextResponse } from 'next/server';
import { MysticAppointmentService, createSupabaseAdminClient } from '@template/api';
import { firstZodIssueMessage, mysticCreateAppointmentSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';
import { getServiceById } from '@template/mystic';
import { z } from 'zod';

const listSchema = z.object({
  workspaceId: z.uuid(),
  from: z.string().datetime(),
  to: z.string().datetime(),
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

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const parsed = mysticCreateAppointmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const service = new MysticAppointmentService(admin);
    const appointment = await service.create({
      workspaceId: parsed.data.workspaceId,
      clientUserId: auth.user.id,
      serviceId: parsed.data.serviceId,
      startsAt: parsed.data.scheduledAt,
      durationMinutes: getServiceById(parsed.data.serviceId).durationMinutes,
      address: parsed.data.address,
      distanceMiles: parsed.data.distanceMiles,
      entitlement: parsed.data.entitlement,
      quoteCents: parsed.data.quoteCents,
      surchargeJson: parsed.data.surchargeJson,
      tipCents: parsed.data.tipCents,
      tags: parsed.data.tags,
      referredByName: parsed.data.referredByName,
      clientNotes: parsed.data.clientNotes,
    });

    // Confirmation email/SMS runs in onMysticAppointmentConfirmed after payment or credit booking.

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.appointments.create');
  }
}
