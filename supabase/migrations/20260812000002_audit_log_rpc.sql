-- ============================================================
-- Add RPC for audit logging so clients can log events securely
-- without needing direct service_role access.
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_workspace_id UUID,
  p_action TEXT,
  p_target_type TEXT,
  p_target_id TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (workspace_id, actor_id, action, target_type, target_id, metadata)
  VALUES (
    p_workspace_id,
    auth.uid(), -- Securely derive the actor_id from the authenticated context
    p_action,
    p_target_type,
    p_target_id,
    p_metadata
  );
END;
$$;
