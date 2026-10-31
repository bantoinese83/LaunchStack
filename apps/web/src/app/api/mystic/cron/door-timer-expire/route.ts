import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { captureAppointmentDeposit } from '@/lib/mystic/capture-deposit';
import { routeErrorResponse } from '@/lib/api/route-auth';

function authorizeCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET ?? process.env.MYSTIC_CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== 'production';
  const header = req.headers.get('authorization');
  return header === `Bearer ${secret}`;
}

/** Auto no-show + deposit capture when door timer expires. Wire Vercel Cron or Supabase scheduler. */
export async function POST(req: Request) {
  try {
    if (!authorizeCron(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();
    const now = new Date().toISOString();

    const { data: expired, error } = await admin
      .from('mystic_appointments')
      .select('id')
      .eq('status', 'door_timer_active')
      .lt('door_timer_ends_at', now);

    if (error) throw error;

    const results: { id: string; ok: boolean; error?: string }[] = [];
    for (const row of expired ?? []) {
      try {
        await captureAppointmentDeposit(admin, row.id);
        results.push({ id: row.id, ok: true });
      } catch (err) {
        results.push({
          id: row.id,
          ok: false,
          error: err instanceof Error ? err.message : 'capture failed',
        });
      }
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.cron.doorTimerExpire');
  }
}
