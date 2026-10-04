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
    // The log_audit_event RPC securely derives the actor_id from auth.uid()
    // inside a SECURITY DEFINER function, so the provided actorId parameter
    // is technically ignored by the RPC, but we keep it in the signature
    // for backward compatibility and server-side contexts.
    await this.client.rpc('log_audit_event', {
      p_workspace_id: workspaceId,
      p_action: action,
      p_target_type: targetType,
      p_target_id: targetId,
      p_metadata: metadata,
    });
  }
}
