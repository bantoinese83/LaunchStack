import type { SupabaseClient } from '@supabase/supabase-js';

export type MysticMessageRow = {
  id: string;
  workspace_id: string;
  client_user_id: string;
  appointment_id: string | null;
  sender_role: 'client' | 'stylist';
  sender_id: string;
  body: string;
  attachment_urls: string[];
  read_at: string | null;
  created_at: string;
};

export class MysticMessageService {
  constructor(private supabase: SupabaseClient) {}

  async listThread(workspaceId: string, clientUserId: string, limit = 50) {
    const { data, error } = await this.supabase
      .from('mystic_messages')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('client_user_id', clientUserId)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as MysticMessageRow[];
  }

  async send(input: {
    workspaceId: string;
    clientUserId: string;
    senderId: string;
    senderRole: 'client' | 'stylist';
    body: string;
    appointmentId?: string;
    attachmentUrls?: string[];
  }) {
    const { data, error } = await this.supabase
      .from('mystic_messages')
      .insert({
        workspace_id: input.workspaceId,
        client_user_id: input.clientUserId,
        sender_id: input.senderId,
        sender_role: input.senderRole,
        body: input.body,
        appointment_id: input.appointmentId ?? null,
        attachment_urls: input.attachmentUrls ?? [],
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as MysticMessageRow;
  }
}
