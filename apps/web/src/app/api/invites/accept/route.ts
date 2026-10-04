import { NextResponse } from 'next/server';
import { InviteService } from '@template/api';
import { acceptInviteSchema, firstZodIssueMessage } from '@template/validation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const validation = acceptInviteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: firstZodIssueMessage(validation.error) }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const workspaceId = await new InviteService(supabase).acceptInvite(validation.data.token);
    return NextResponse.json({ ok: true, workspaceId });
  } catch (err) {
    return routeErrorResponse(err, '[Accept Invite Route Error]');
  }
}
