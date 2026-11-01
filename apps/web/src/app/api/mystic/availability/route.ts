import { NextResponse } from 'next/server';
import { MysticAppointmentService, createSupabaseAdminClient } from '@template/api';
import {
  buildTimeSlotsForDate,
  getServiceById,
  zonedDayRangeIso,
  DEFAULT_SURCHARGE_RULES,
  filterSlotsByBlockedIntervals,
  resolveStudioHoursForDate,
} from '@template/mystic';
import { z } from 'zod';
import { SERVICE_IDS } from '@template/mystic';
import { firstZodIssueMessage } from '@template/validation';
import { routeErrorResponse } from '@/lib/api/route-auth';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import {
  loadStudioSettingsExtended,
  studioSettingsToBookingHours,
} from '@/lib/mystic/studio-booking-config';

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceId: z.enum(SERVICE_IDS),
  winterBuffer: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

export async function GET(req: Request) {
  try {
    const params = Object.fromEntries(new URL(req.url).searchParams);
    const parsed = querySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const service = getServiceById(parsed.data.serviceId);
    const workspaceId = getMysticWorkspaceId();
    const admin = createSupabaseAdminClient();
    await new MysticAppointmentService(admin).cancelStalePending(workspaceId, 90);

    const settings = await loadStudioSettingsExtended(admin, workspaceId);
    const hoursConfig = studioSettingsToBookingHours(settings);
    const dayHours = resolveStudioHoursForDate(parsed.data.date, hoursConfig);
    if (!dayHours) {
      return NextResponse.json({ slots: [], closed: true, bufferMinutes: 0 });
    }

    const { data: blockedDay } = await admin
      .from('mystic_blocked_dates')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('block_date', parsed.data.date)
      .maybeSingle();

    if (blockedDay) {
      return NextResponse.json({ slots: [], blocked: true, bufferMinutes: 0 });
    }

    const useWinterBuffer = parsed.data.winterBuffer ?? settings?.winter_buffer_enabled ?? false;

    const { from: dayStart, to: dayEnd } = zonedDayRangeIso(parsed.data.date);

    const { data: rows, error } = await admin
      .from('mystic_appointments')
      .select('starts_at, duration_minutes')
      .eq('workspace_id', workspaceId)
      .gte('starts_at', dayStart)
      .lte('starts_at', dayEnd)
      .neq('status', 'canceled');

    if (error) throw error;

    const booked = (rows ?? []).map((row) => ({
      start: new Date(row.starts_at as string),
      durationMinutes: row.duration_minutes ?? undefined,
    }));
    const buffer = useWinterBuffer
      ? DEFAULT_SURCHARGE_RULES.winterTravelBufferMinutes
      : DEFAULT_SURCHARGE_RULES.defaultTravelBufferMinutes;

    let slots = buildTimeSlotsForDate(parsed.data.date, service.durationMinutes, buffer, booked, {
      hours: {
        startHour: dayHours.startHour,
        endHour: dayHours.endHour,
        slotMinutes: dayHours.slotMinutes,
      },
    });

    const { data: blockedIntervals } = await admin
      .from('mystic_blocked_intervals')
      .select('starts_at, ends_at')
      .eq('workspace_id', workspaceId)
      .lt('starts_at', dayEnd)
      .gt('ends_at', dayStart);

    slots = filterSlotsByBlockedIntervals(
      parsed.data.date,
      slots,
      service.durationMinutes,
      (blockedIntervals ?? []).map((b) => ({
        startsAt: b.starts_at as string,
        endsAt: b.ends_at as string,
      }))
    );

    return NextResponse.json({ slots, bufferMinutes: buffer });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.availability');
  }
}
