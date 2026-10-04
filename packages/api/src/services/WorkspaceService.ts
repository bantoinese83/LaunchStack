import { SupabaseClient } from '@supabase/supabase-js';
import { Workspace, WorkspaceMember } from '@template/types';

export class WorkspaceService {
  constructor(private client: SupabaseClient) {}

  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    const { data, error } = await this.client
      .from('workspace_members')
      .select('workspace:workspaces(*)')
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((item) => item.workspace as Workspace | Workspace[] | null)
      .flat()
      .filter((workspace): workspace is Workspace => workspace != null);
  }

  async getWorkspaceBySlug(slug: string): Promise<Workspace | null> {
    const { data, error } = await this.client
      .from('workspaces')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) return null;
    return data as Workspace;
  }

  async createWorkspace(userId: string, name: string, slug: string): Promise<Workspace> {
    // Fix L4: Use an atomic RPC instead of two sequential inserts.
    // Previously, a failure between the workspace insert and the membership insert
    // would leave an ownerless workspace that RLS would hide from everyone.
    // The create_workspace_with_owner function wraps both inserts in a single
    // Postgres transaction (defined in migration 20260812000001_rls_security_fixes.sql).
    const { data: workspace, error } = await this.client.rpc('create_workspace_with_owner', {
      p_name: name,
      p_slug: slug,
      p_user_id: userId,
    });

    if (error) throw new Error(error.message);

    return workspace as Workspace;
  }

  async updateWorkspace(
    workspaceId: string,
    updates: { name?: string; logoUrl?: string | null }
  ): Promise<Workspace> {
    const payload: { name?: string; logo_url?: string | null } = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.logoUrl !== undefined) payload.logo_url = updates.logoUrl;

    const { data, error } = await this.client
      .from('workspaces')
      .update(payload)
      .eq('id', workspaceId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Workspace;
  }

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const { data, error } = await this.client
      .from('workspace_members')
      .select('*, profile:profiles(*)')
      .eq('workspace_id', workspaceId);
    if (error) throw new Error(error.message);
    return data as WorkspaceMember[];
  }

  async updateMemberRole(
    memberId: string,
    role: WorkspaceMember['role']
  ): Promise<WorkspaceMember> {
    const { data, error } = await this.client
      .from('workspace_members')
      .update({ role })
      .eq('id', memberId)
      .select('*, profile:profiles(*)')
      .single();
    if (error) throw new Error(error.message);
    return data as WorkspaceMember;
  }

  async removeMember(memberId: string): Promise<void> {
    const { error } = await this.client.from('workspace_members').delete().eq('id', memberId);
    if (error) throw new Error(error.message);
  }
}
