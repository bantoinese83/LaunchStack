import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { FEEDBACK_STATUSES } from '@template/types';
import { z } from 'zod';
import { firstZodIssueMessage } from '@template/validation';

const updateSchema = z.object({
  postId: z.uuid(),
  flagged: z.boolean().optional(),
  status: z.enum(FEEDBACK_STATUSES).optional(),
});

export async function GET() {
  const { requireSuperAdmin } = await import('@/lib/require-super-admin');
  const gate = await requireSuperAdmin();
  if (gate.response) return gate.response;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('feedback_posts')
    .select('*, author:profiles(*)')
    .eq('flagged', true)
    .order('updated_at', { ascending: false })
    .limit(50);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ posts: data ?? [] });
}

export async function POST(req: Request) {
  const { requireSuperAdmin } = await import('@/lib/require-super-admin');
  const gate = await requireSuperAdmin();
  if (gate.response) return gate.response;
  const validation = updateSchema.safeParse(await req.json());
  if (!validation.success) {
    return NextResponse.json({ error: firstZodIssueMessage(validation.error) }, { status: 400 });
  }
  const admin = createSupabaseAdminClient();
  const updates: Record<string, unknown> = {};
  if (validation.data.flagged !== undefined) updates.flagged = validation.data.flagged;
  if (validation.data.status) updates.status = validation.data.status;
  const { error } = await admin
    .from('feedback_posts')
    .update(updates)
    .eq('id', validation.data.postId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
