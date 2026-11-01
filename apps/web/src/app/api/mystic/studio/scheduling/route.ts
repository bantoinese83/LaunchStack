import { NextResponse } from 'next/server';
import { MysticStudioService, createSupabaseAdminClient } from '@template/api';
import { firstZodIssueMessage, mysticStudioSchedulingSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';

export async function PATCH(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticStudioSchedulingSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const { workspaceId, bookingStartHour, bookingEndHour, slotMinutes, weeklyHours } = parsed.data;
    const admin = createSupabaseAdminClient();
    const rowPatch: Record<string, unknown> = {};
    if (bookingStartHour != null) rowPatch.booking_start_hour = bookingStartHour;
    if (bookingEndHour != null) rowPatch.booking_end_hour = bookingEndHour;
    if (slotMinutes != null) rowPatch.slot_minutes = slotMinutes;
    if (weeklyHours != null) rowPatch.weekly_hours = weeklyHours;
    const settings = await new MysticStudioService(admin).upsertSettings(workspaceId, rowPatch);

    return NextResponse.json({ settings });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.studio.scheduling');
  }
}
