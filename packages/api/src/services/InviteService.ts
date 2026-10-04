import { SupabaseClient } from '@supabase/supabase-js';
import { InvitableWorkspaceRole, WorkspaceInvite } from '@template/types';

function createInviteToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export class InviteService {
  constructor(private client: SupabaseClient) {}

  async createInvite(
    workspaceId: string,
    email: string,
    role: InvitableWorkspaceRole,
    invitedBy: string
  ): Promise<WorkspaceInvite> {
    const token = createInviteToken();
    const { data, error } = await this.client
      .from('workspace_invites')
      .insert({
        workspace_id: workspaceId,
        email: email.toLowerCase(),
        role,
        token,
        invited_by: invitedBy,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as WorkspaceInvite;
  }

  async getInviteByToken(token: string): Promise<WorkspaceInvite | null> {
    const { data, error } = await this.client
      .from('workspace_invites')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as WorkspaceInvite | null) ?? null;
  }

  async listPending(workspaceId: string): Promise<WorkspaceInvite[]> {
    const { data, error } = await this.client
      .from('workspace_invites')
      .select('*')
      .eq('workspace_id', workspaceId)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as WorkspaceInvite[];
  }

  async revokeInvite(inviteId: string): Promise<void> {
    const { error } = await this.client.from('workspace_invites').delete().eq('id', inviteId);
    if (error) throw new Error(error.message);
  }

  async acceptInvite(token: string): Promise<string> {
    const { data, error } = await this.client.rpc('accept_workspace_invite', {
      p_token: token,
    });
    if (error) throw new Error(error.message);
    return data as string;
  }
}
