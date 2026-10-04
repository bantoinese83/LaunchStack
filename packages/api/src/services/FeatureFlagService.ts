import { SupabaseClient } from '@supabase/supabase-js';
import { FeatureFlag } from '@template/types';

export class FeatureFlagService {
  constructor(private client: SupabaseClient) {}

  async listFlags(): Promise<FeatureFlag[]> {
    const { data, error } = await this.client
      .from('feature_flags')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as FeatureFlag[];
  }

  async upsertFlag(flag: {
    id?: string;
    key: string;
    description: string;
    enabled_globally: boolean;
    target_workspaces: string[];
  }): Promise<FeatureFlag> {
    const { data, error } = await this.client.from('feature_flags').upsert(flag).select().single();
    if (error) throw new Error(error.message);
    return data as FeatureFlag;
  }
}
