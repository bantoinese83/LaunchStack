import { NextResponse } from 'next/server';
import { FeatureFlagService, createSupabaseAdminClient } from '@template/api';
import { z } from 'zod';
import { firstZodIssueMessage } from '@template/validation';

const schema = z.object({
  id: z.uuid().optional(),
  key: z.string().min(2),
  description: z.string().min(1),
  enabled_globally: z.boolean(),
  target_workspaces: z.array(z.uuid()).default([]),
});

export async function GET() {
  const { requireSuperAdmin } = await import('@/lib/require-super-admin');
  const auth = await requireSuperAdmin();
  if (auth.response) return auth.response;
  const flags = await new FeatureFlagService(createSupabaseAdminClient()).listFlags();
  return NextResponse.json({ flags });
}

export async function POST(req: Request) {
  const { requireSuperAdmin } = await import('@/lib/require-super-admin');
  const auth = await requireSuperAdmin();
  if (auth.response) return auth.response;
  const validation = schema.safeParse(await req.json());
  if (!validation.success) {
    return NextResponse.json({ error: firstZodIssueMessage(validation.error) }, { status: 400 });
  }
  const flag = await new FeatureFlagService(createSupabaseAdminClient()).upsertFlag(
    validation.data
  );
  return NextResponse.json({ flag });
}
