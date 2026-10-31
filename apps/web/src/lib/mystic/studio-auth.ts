import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createSupabaseAdminClient } from '@template/api';
import { canManageMembers } from '@template/auth';

export async function requireStudioManager(user: User, workspaceId: string) {
  const admin = createSupabaseAdminClient();
  const { data: membership } = await admin
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!canManageMembers(membership?.role ?? null)) {
    return NextResponse.json({ error: 'Forbidden: studio access required' }, { status: 403 });
  }
  return null;
}
