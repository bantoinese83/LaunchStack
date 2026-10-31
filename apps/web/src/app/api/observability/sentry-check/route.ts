import { NextResponse } from 'next/server';
import { routeErrorResponse } from '@/lib/api/route-auth';

/** Production Sentry smoke — requires `x-mystic-probe` matching MYSTIC_SENTRY_PROBE_SECRET. */
export async function GET(req: Request) {
  const secret = process.env.MYSTIC_SENTRY_PROBE_SECRET;
  if (!secret || req.headers.get('x-mystic-probe') !== secret) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    throw new Error('Mystic Hair Co. production Sentry smoke test');
  } catch (err) {
    return routeErrorResponse(err, 'observability.sentryCheck');
  }
}
