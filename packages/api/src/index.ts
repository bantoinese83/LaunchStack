import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  FeedbackCategory,
  FeedbackPost,
  FeedbackStatus,
  Profile,
  Subscription,
  Workspace,
  WorkspaceMember,
} from '@template/types';

// CLIENT FACTORIES
export const createSupabaseBrowserClient = (
  supabaseUrl?: string,
  supabaseKey?: string
): SupabaseClient => {
  const url =
    supabaseUrl ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const key =
    supabaseKey ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  if (!url || !key) {
    throw new Error(
      'Supabase URL and anon key are required. Set NEXT_PUBLIC_SUPABASE_* (web) or EXPO_PUBLIC_SUPABASE_* (mobile).'
    );
  }
  return createClient(url, key);
};

export const createSupabaseAdminClient = (
  supabaseUrl?: string,
  serviceRoleKey?: string
): SupabaseClient => {
  const url =
    supabaseUrl ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const key = serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) {
    throw new Error('[SECURITY ALERT] Service role key missing for admin client');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

// DOMAIN DATA HELPERS
export class DomainAPI {
  constructor(private client: SupabaseClient) {}

  // USER PROFILE
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data as Profile;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.client
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Profile;
  }

  // WORKSPACES
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

    // Insert owner member record
    const { error: memError } = await this.client.from('workspace_members').insert({
      workspace_id: workspace.id,
      user_id: userId,
      role: 'workspace_owner',
    });

    if (memError) throw new Error(memError.message);

    return workspace as Workspace;
  }

  // WORKSPACE MEMBERS
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const { data, error } = await this.client
      .from('workspace_members')
      .select('*, profile:profiles(*)')
      .eq('workspace_id', workspaceId);
    if (error) throw new Error(error.message);
    return data as WorkspaceMember[];
  }

  // FEEDBACK
  async getWorkspaceFeedback(workspaceId: string): Promise<FeedbackPost[]> {
    const { data, error } = await this.client
      .from('feedback_posts')
      .select('*, author:profiles(*)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as FeedbackPost[];
  }

  async createFeedbackPost(
    workspaceId: string,
    authorId: string,
    title: string,
    description: string,
    category: FeedbackCategory
  ): Promise<FeedbackPost> {
    const { data, error } = await this.client
      .from('feedback_posts')
      .insert({
        workspace_id: workspaceId,
        author_id: authorId,
        title,
        description,
        category,
      })
      .select('*, author:profiles(*)')
      .single();
    if (error) throw new Error(error.message);
    return data as FeedbackPost;
  }

  async upvoteFeedback(postId: string, userId: string): Promise<void> {
    const { error } = await this.client.from('feedback_votes').insert({
      post_id: postId,
      user_id: userId,
    });
    if (error) throw new Error(error.message);
  }

  async updateFeedbackStatus(postId: string, status: FeedbackStatus): Promise<FeedbackPost> {
    const { data, error } = await this.client
      .from('feedback_posts')
      .update({ status })
      .eq('id', postId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as FeedbackPost;
  }

  // SUBSCRIPTION
  async getWorkspaceSubscription(workspaceId: string): Promise<Subscription | null> {
    const { data, error } = await this.client
      .from('subscriptions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .single();
    if (error) return null;
    return data as Subscription;
  }

  // AUDIT LOGS
  async logAuditEvent(
    workspaceId: string | null,
    actorId: string,
    action: string,
    targetType: string,
    targetId: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    await this.client.from('audit_logs').insert({
      workspace_id: workspaceId,
      actor_id: actorId,
      action,
      target_type: targetType,
      target_id: targetId,
      metadata,
    });
  }
}
