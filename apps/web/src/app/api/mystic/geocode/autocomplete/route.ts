import { NextResponse } from 'next/server';
import { z } from 'zod';
import { firstZodIssueMessage } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { searchAddressSuggestions } from '@/lib/mystic/geocode';

const querySchema = z.object({
  q: z.string().min(3).max(200),
});

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const q = new URL(req.url).searchParams.get('q') ?? '';
    const parsed = querySchema.safeParse({ q });
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const suggestions = await searchAddressSuggestions(parsed.data.q);
    return NextResponse.json({ suggestions });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.geocode.autocomplete');
  }
}
