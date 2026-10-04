-- Moderation, plan overrides, push tokens, recovery codes, invite revoke.

ALTER TABLE public.feedback_posts
  ADD COLUMN IF NOT EXISTS flagged BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS plan_override TEXT
    CHECK (plan_override IS NULL OR plan_override IN ('free', 'pro', 'enterprise'));

CREATE TABLE IF NOT EXISTS public.push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'unknown',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, token)
);

CREATE TABLE IF NOT EXISTS public.mfa_recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_recovery_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push tokens"
  ON public.push_tokens FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own recovery codes"
  ON public.mfa_recovery_codes FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Workspace admins can update invites"
  ON public.workspace_invites FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = public.workspace_invites.workspace_id
        AND user_id = auth.uid()
        AND role IN ('workspace_owner', 'workspace_admin')
    )
  );

CREATE POLICY "Workspace admins can delete invites"
  ON public.workspace_invites FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = public.workspace_invites.workspace_id
        AND user_id = auth.uid()
        AND role IN ('workspace_owner', 'workspace_admin')
    )
  );
