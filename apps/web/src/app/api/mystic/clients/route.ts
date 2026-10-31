import { NextResponse } from 'next/server';
import {
  MysticCreditsService,
  createSupabaseAdminClient,
  groupCreditsByUserId,
} from '@template/api';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const url = new URL(req.url);
    const workspaceId = url.searchParams.get('workspaceId') ?? getMysticWorkspaceId();
    const forbidden = await requireStudioManager(auth.user, workspaceId);
    if (forbidden) return forbidden;

    const admin = createSupabaseAdminClient();
    const credits = new MysticCreditsService(admin);
    const clients = await credits.listClientsForStudio(workspaceId);

    // Credits are opt-in (`?credits=1`). Only the clients screen renders them —
    // the today board, calendar, composer and mobile screens just need names, and
    // the old per-client lookup cost one query per client (up to 500).
    const wantsCredits = url.searchParams.get('credits') === '1';
    const creditsByUser =
      wantsCredits && clients.length
        ? groupCreditsByUserId(await credits.listForWorkspace(workspaceId))
        : null;

    const enriched = clients.map((client) => ({
      ...client,
      credits: creditsByUser?.[client.user_id] ?? [],
    }));

    return NextResponse.json({ clients: enriched });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.clients.list');
  }
}
