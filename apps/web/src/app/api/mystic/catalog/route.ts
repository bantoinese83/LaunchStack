import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { mergeMenuOverrides } from '@template/mystic';
import { routeErrorResponse } from '@/lib/api/route-auth';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import {
  loadStudioSettingsExtended,
  studioMenuOverrides,
} from '@/lib/mystic/studio-booking-config';

/** Public menu with studio CMS overrides applied. */
export async function GET() {
  try {
    const workspaceId = getMysticWorkspaceId();
    const admin = createSupabaseAdminClient();
    const settings = await loadStudioSettingsExtended(admin, workspaceId);
    const services = mergeMenuOverrides(studioMenuOverrides(settings));
    return NextResponse.json({ services });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.catalog');
  }
}
