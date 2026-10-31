import { NextResponse } from 'next/server';
import { mysticAddressSchema } from '@template/validation';
import { firstZodIssueMessage } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { geocodeHouseCallAddress } from '@/lib/mystic/geocode';

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticAddressSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const result = await geocodeHouseCallAddress(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Geocode failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
