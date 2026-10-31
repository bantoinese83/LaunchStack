import { createSupabaseAdminClient } from '@template/api';
import { canManageMembers } from '@template/auth';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

export async function userCanAccessMysticStudio(userId: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const workspaceId = getMysticWorkspaceId();
  const { data: membership } = await admin
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .maybeSingle();

  return canManageMembers(membership?.role ?? null);
}
