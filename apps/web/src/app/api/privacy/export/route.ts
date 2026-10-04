import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const admin = createSupabaseAdminClient();
    const userId = auth.user.id;
    const [
      { data: profile },
      { data: memberships },
      { data: feedback },
      { data: invites },
      { data: consent },
    ] = await Promise.all([
      admin.from('profiles').select('*').eq('id', userId).single(),
      admin.from('workspace_members').select('*, workspace:workspaces(*)').eq('user_id', userId),
      admin.from('feedback_posts').select('*').eq('author_id', userId),
      admin.from('workspace_invites').select('*').eq('email', auth.user.email),
      admin.from('consent_records').select('*').eq('user_id', userId).maybeSingle(),
    ]);

    const payload = {
      exported_at: new Date().toISOString(),
      profile,
      memberships,
      feedback,
      invites,
      consent,
    };

    await admin.from('data_export_requests').insert({
      user_id: userId,
      status: 'ready',
      payload,
    });

    return NextResponse.json(payload);
  } catch (err) {
    return routeErrorResponse(err, '[Privacy Export Route Error]');
  }
}
