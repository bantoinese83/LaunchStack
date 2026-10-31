import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { buildTimeSlotsForDate, getServiceById, DEFAULT_SURCHARGE_RULES } from '@template/mystic';
import { z } from 'zod';
import { SERVICE_IDS } from '@template/mystic';
import { firstZodIssueMessage } from '@template/validation';
import { routeErrorResponse } from '@/lib/api/route-auth';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

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

    const { data: blocked } = await admin
      .from('mystic_blocked_dates')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('block_date', parsed.data.date)
      .maybeSingle();

    if (blocked) {
      return NextResponse.json({ slots: [], blocked: true, bufferMinutes: 0 });
    }

    const { data: settings } = await admin
      .from('mystic_studio_settings')
      .select('winter_buffer_enabled')
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    const useWinterBuffer = parsed.data.winterBuffer ?? settings?.winter_buffer_enabled ?? false;

    const dayStart = `${parsed.data.date}T00:00:00.000Z`;
    const dayEnd = `${parsed.data.date}T23:59:59.999Z`;

    const { data: rows, error } = await admin
      .from('mystic_appointments')
      .select('starts_at, duration_minutes')
      .eq('workspace_id', workspaceId)
      .gte('starts_at', dayStart)
      .lte('starts_at', dayEnd)
      .neq('status', 'canceled');

    if (error) throw error;

    const bookedStarts = (rows ?? []).map((row) => new Date(row.starts_at as string));
    const buffer = useWinterBuffer
      ? DEFAULT_SURCHARGE_RULES.winterTravelBufferMinutes
      : DEFAULT_SURCHARGE_RULES.defaultTravelBufferMinutes;

    const slots = buildTimeSlotsForDate(
      parsed.data.date,
      service.durationMinutes,
      buffer,
      bookedStarts
    );

    return NextResponse.json({ slots, bufferMinutes: buffer });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.availability');
  }
}
