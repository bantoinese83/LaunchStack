import { NextResponse } from 'next/server';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { userCanAccessMysticStudio } from '@/lib/mystic/studio-access';

/** Mobile + web: whether the signed-in user can open Luke's studio CMS. */
export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const workspaceId = getMysticWorkspaceId();
    const allowed = await userCanAccessMysticStudio(auth.user.id);

    return NextResponse.json({ allowed, workspaceId });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.studio.access');
  }
}
