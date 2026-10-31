import { NextResponse } from 'next/server';
import { MysticCreditsService, createSupabaseAdminClient } from '@template/api';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const workspaceId = getMysticWorkspaceId();
    const admin = createSupabaseAdminClient();
    const credits = await new MysticCreditsService(admin).listForUser(workspaceId, auth.user.id);
    return NextResponse.json({ credits });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.credits.mine');
  }
}
