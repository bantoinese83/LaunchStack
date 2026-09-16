import { SupabaseClient } from '@supabase/supabase-js';

export class AuditService {
  constructor(private client: SupabaseClient) {}

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
