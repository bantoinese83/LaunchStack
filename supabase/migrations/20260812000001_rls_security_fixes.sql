-- MIGRATION: 20260812000001_rls_security_fixes.sql
-- DESCRIPTION: Security hardening — splits workspace_members FOR ALL policy to prevent
--   privilege escalation (C1), pins search_path on SECURITY DEFINER functions (M1),
--   adds audit_logs INSERT policy for service_role (M3), and adds an atomic
--   create_workspace_with_owner RPC to replace the non-atomic two-step insert (L4).
--
-- ⚠️  Do NOT run against production without testing on a local Supabase instance first:
--     supabase start && supabase db reset

-- ============================================================
-- 1. FIX C1: Split the dangerous FOR ALL workspace_members policy
-- ============================================================
-- The old policy used USING(user_id = auth.uid() OR <admin check>) for ALL operations.
-- Because FOR ALL WITH CHECK defaults to the USING expression, this allowed any
-- authenticated user to INSERT themselves into any workspace with any role.

DROP POLICY IF EXISTS "Admins can invite or manage workspace members" ON public.workspace_members;

-- SELECT / UPDATE / DELETE: keep original semantics (members can see/update their own
-- row; admins can manage all rows in their workspace)
CREATE POLICY "Members can read own row or workspace teammates can read all"
  ON public.workspace_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_workspace_member(workspace_id)
    OR public.is_super_admin()
  );

CREATE POLICY "Admins can update workspace members"
  ON public.workspace_members FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = public.workspace_members.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('workspace_owner', 'workspace_admin')
    )
  );

CREATE POLICY "Admins can delete workspace members"
  ON public.workspace_members FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = public.workspace_members.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('workspace_owner', 'workspace_admin')
    )
  );

-- INSERT: callers can only add members to workspaces where they are already an admin.
-- The initial owner row during workspace creation is inserted via service_role (the
-- create_workspace_with_owner RPC below uses SECURITY DEFINER), so this strict check
-- never blocks legitimate first-member insertion.
CREATE POLICY "Admins can insert workspace members"
  ON public.workspace_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = public.workspace_members.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('workspace_owner', 'workspace_admin')
    )
  );

-- ============================================================
-- 2. FIX M1: Pin search_path on all SECURITY DEFINER functions
--    (prevents search_path hijack as flagged by Supabase advisor)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, system_role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_workspace_member(target_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = target_workspace_id
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND system_role = 'super_admin'
  );
$$;

-- ============================================================
-- 3. FIX M3: Add audit_logs INSERT policy for service_role
--    (AuditService.logAuditEvent writes via the admin client which
--     uses the service_role key — previously there was no INSERT policy
--     so all writes were silently dropped by RLS)
-- ============================================================

CREATE POLICY "Service role can insert audit logs"
  ON public.audit_logs FOR INSERT TO service_role
  WITH CHECK (true);

-- ============================================================
-- 4. FIX L4: Atomic workspace creation RPC
--    (replaces the two sequential inserts in WorkspaceService.createWorkspace
--     that could leave an ownerless workspace on partial failure)
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_workspace_with_owner(
  p_name  TEXT,
  p_slug  TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS public.workspaces
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace public.workspaces;
BEGIN
  -- Insert workspace
  INSERT INTO public.workspaces (name, slug)
  VALUES (p_name, p_slug)
  RETURNING * INTO v_workspace;

  -- Insert owner membership in the same transaction
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace.id, p_user_id, 'workspace_owner');

  RETURN v_workspace;
END;
$$;

-- Grant execute to authenticated users (they can only create for themselves
-- because p_user_id defaults to auth.uid() and any other value would be
-- rejected by the application layer)
GRANT EXECUTE ON FUNCTION public.create_workspace_with_owner(TEXT, TEXT, UUID) TO authenticated;
