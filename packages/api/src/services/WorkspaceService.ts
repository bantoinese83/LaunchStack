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
    const { data: workspace, error: wsError } = await this.client
      .from('workspaces')
      .insert({ name, slug })
      .select()
      .single();

    if (wsError) throw new Error(wsError.message);

    const { error: memError } = await this.client.from('workspace_members').insert({
      workspace_id: workspace.id,
      user_id: userId,
      role: 'workspace_owner',
    });

    if (memError) throw new Error(memError.message);

    return workspace as Workspace;
  }

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const { data, error } = await this.client
      .from('workspace_members')
      .select('*, profile:profiles(*)')
      .eq('workspace_id', workspaceId);
    if (error) throw new Error(error.message);
    return data as WorkspaceMember[];
  }
}
