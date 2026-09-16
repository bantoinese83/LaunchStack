import { SupabaseClient } from '@supabase/supabase-js';
import { Subscription } from '@template/types';

export class SubscriptionService {
  constructor(private client: SupabaseClient) {}

  async getWorkspaceSubscription(workspaceId: string): Promise<Subscription | null> {
    const { data, error } = await this.client
      .from('subscriptions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .single();
    if (error) return null;
    return data as Subscription;
  }
}
