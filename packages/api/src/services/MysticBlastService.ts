import type { SupabaseClient } from '@supabase/supabase-js';

export type MysticBlastRow = {
  id: string;
  workspace_id: string;
  channel: 'email' | 'sms' | 'both';
  segment: string;
  subject: string | null;
  body: string;
  status: string;
  recipient_count: number;
  sent_at: string | null;
  created_at: string;
};

export class MysticBlastService {
  constructor(private supabase: SupabaseClient) {}

  async createDraft(input: {
    workspaceId: string;
    createdBy: string;
    channel: 'email' | 'sms' | 'both';
    segment: string;
    subject?: string;
    body: string;
  }) {
    const { data, error } = await this.supabase
      .from('mystic_blasts')
      .insert({
        workspace_id: input.workspaceId,
        created_by: input.createdBy,
        channel: input.channel,
        segment: input.segment,
        subject: input.subject ?? null,
        body: input.body,
        status: 'draft',
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as MysticBlastRow;
  }

  async markSent(id: string, recipientCount: number) {
    const { data, error } = await this.supabase
      .from('mystic_blasts')
      .update({
        status: 'sent',
        recipient_count: recipientCount,
        sent_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as MysticBlastRow;
  }

  async list(workspaceId: string) {
    const { data, error } = await this.supabase
      .from('mystic_blasts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as MysticBlastRow[];
  }
}
