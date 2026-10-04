import { NextResponse } from 'next/server';
import { FeatureFlagService, createSupabaseAdminClient } from '@template/api';
import { isFeatureEnabled } from '@template/feature-flags';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { withRouteSpan } from '@/lib/observability';

export async function GET(req: Request) {
  return withRouteSpan('flags.list', async () => {
    try {
      const auth = await requireAuthenticatedUser(req);
      if (auth.response) return auth.response;
      const workspaceId = new URL(req.url).searchParams.get('workspaceId') ?? undefined;
      const flags = await new FeatureFlagService(createSupabaseAdminClient()).listFlags();
      return NextResponse.json({
        flags: flags.map((flag) => ({
          ...flag,
          enabled: isFeatureEnabled(flag, workspaceId),
        })),
      });
    } catch (err) {
      return routeErrorResponse(err, '[Flags]');
    }
  });
}
