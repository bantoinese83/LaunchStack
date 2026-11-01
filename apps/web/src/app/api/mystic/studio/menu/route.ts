import { NextResponse } from 'next/server';
import { MysticStudioService, createSupabaseAdminClient } from '@template/api';
import { firstZodIssueMessage, mysticStudioMenuOverridesSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { requireStudioManager } from '@/lib/mystic/studio-auth';

export async function PATCH(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticStudioMenuOverridesSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const admin = createSupabaseAdminClient();
    const settings = await new MysticStudioService(admin).upsertSettings(parsed.data.workspaceId, {
      menu_overrides: parsed.data.menuOverrides,
    });

    return NextResponse.json({ settings });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.studio.menu');
  }
}
