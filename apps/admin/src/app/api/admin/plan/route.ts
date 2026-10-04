import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { z } from 'zod';
import { firstZodIssueMessage } from '@template/validation';

const schema = z.object({
  workspaceId: z.uuid(),
  planOverride: z.enum(['free', 'pro', 'enterprise']).nullable(),
});

export async function POST(req: Request) {
  const { requireSuperAdmin } = await import('@/lib/require-super-admin');
  const auth = await requireSuperAdmin();
  if (auth.response) return auth.response;
  const validation = schema.safeParse(await req.json());
  if (!validation.success) {
    return NextResponse.json({ error: firstZodIssueMessage(validation.error) }, { status: 400 });
  }
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from('workspaces')
    .update({ plan_override: validation.data.planOverride })
    .eq('id', validation.data.workspaceId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
