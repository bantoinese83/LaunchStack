import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { z } from 'zod';
import { firstZodIssueMessage } from '@template/validation';

const schema = z.object({ email: z.email() });

export async function POST(req: Request) {
  const { requireSuperAdmin } = await import('@/lib/require-super-admin');
  const auth = await requireSuperAdmin();
  if (auth.response) return auth.response;
  const validation = schema.safeParse(await req.json());
  if (!validation.success) {
    return NextResponse.json({ error: firstZodIssueMessage(validation.error) }, { status: 400 });
  }
  const admin = createSupabaseAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL is required' }, { status: 500 });
  }
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: validation.data.email,
    options: { redirectTo: `${appUrl}/auth/callback?next=/dashboard` },
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({
    actionLink: data.properties.action_link,
    email: validation.data.email,
  });
}
