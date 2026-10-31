import { NextResponse } from 'next/server';
import { MysticCreditsService, createSupabaseAdminClient } from '@template/api';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const workspaceId = new URL(req.url).searchParams.get('workspaceId') ?? getMysticWorkspaceId();
    const forbidden = await requireStudioManager(auth.user, workspaceId);
    if (forbidden) return forbidden;

    const admin = createSupabaseAdminClient();
    const clients = await new MysticCreditsService(admin).listClientsForStudio(workspaceId);

    const enriched = await Promise.all(
      clients.map(async (client) => {
        const credits = await new MysticCreditsService(admin).listForUser(
          workspaceId,
          client.user_id
        );
        return { ...client, credits };
      })
    );

    return NextResponse.json({ clients: enriched });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.clients.list');
  }
}
