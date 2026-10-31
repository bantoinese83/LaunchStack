import { NextResponse } from 'next/server';
import { z } from 'zod';
import { firstZodIssueMessage } from '@template/validation';
import { addressLatLng, normalizeAddressFields } from '@template/mystic';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';
import { geocodeHouseCallAddress } from '@/lib/mystic/geocode';

const bodySchema = z.object({
  workspaceId: z.string().uuid(),
  stops: z
    .array(
      z.object({
        id: z.string(),
        address: z.record(z.string(), z.unknown()).optional().default({}),
        label: z.string().optional(),
      })
    )
    .max(24),
});

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const markers: {
      id: string;
      lat: number;
      lng: number;
      label?: string;
    }[] = [];

    for (const stop of parsed.data.stops) {
      const stored = addressLatLng(stop.address);
      if (stored) {
        markers.push({ id: stop.id, lat: stored.lat, lng: stored.lng, label: stop.label });
        continue;
      }
      const a = stop.address as {
        line1?: string;
        city?: string;
        state?: string;
        postalCode?: string;
      };
      if (!a.line1 || !a.city || !a.state || !a.postalCode) continue;
      const normalized = normalizeAddressFields({
        line1: a.line1,
        city: a.city,
        state: a.state,
        postalCode: a.postalCode,
      });
      try {
        const geo = await geocodeHouseCallAddress(normalized);
        markers.push({
          id: stop.id,
          lat: geo.latitude,
          lng: geo.longitude,
          label: stop.label ?? geo.formattedAddress,
        });
      } catch {
        /* skip bad address */
      }
    }

    return NextResponse.json({ markers });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.geocode.batch');
  }
}
