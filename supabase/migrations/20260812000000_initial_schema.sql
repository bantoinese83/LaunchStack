-- MIGRATION: 20260812000000_initial_schema.sql
-- DESCRIPTION: Initial PostgreSQL schema definition, triggers, helper functions, and Row-Level Security policies.

-- 1. PROFILES TABLE (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    system_role TEXT NOT NULL DEFAULT 'user' CHECK (system_role IN ('user', 'super_admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. WORKSPACES TABLE
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. WORKSPACE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'workspace_member' CHECK (role IN ('workspace_owner', 'workspace_admin', 'workspace_member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(workspace_id, user_id)
);

-- 4. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID UNIQUE NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_price_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')),
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. FEEDBACK POSTS TABLE
CREATE TABLE IF NOT EXISTS public.feedback_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'feature' CHECK (category IN ('bug', 'feature', 'improvement')),
    status TEXT NOT NULL DEFAULT 'under_review' CHECK (status IN ('under_review', 'planned', 'in_progress', 'completed', 'declined')),
    upvotes_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. FEEDBACK VOTES TABLE
CREATE TABLE IF NOT EXISTS public.feedback_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.feedback_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(post_id, user_id)
);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. FEATURE FLAGS TABLE
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    enabled_globally BOOLEAN NOT NULL DEFAULT false,
    target_workspaces UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES FOR HIGH-PERFORMANCE FILTERS & RLS
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_ws ON public.workspace_members(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_feedback_posts_ws_status ON public.feedback_posts(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ws ON public.audit_logs(workspace_id);

-- TRIGGER FUNCTION FOR UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_workspaces_modtime BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_workspace_members_modtime BEFORE UPDATE ON public.workspace_members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_feedback_posts_modtime BEFORE UPDATE ON public.feedback_posts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- TRIGGER TO AUTOMATICALLY CREATE PROFILE ON AUTH USER SIGNUP
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- HELPER FUNCTIONS FOR SECURITY & RLS POLICIES
CREATE OR REPLACE FUNCTION public.is_workspace_member(target_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
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
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND system_role = 'super_admin'
  );
$$;

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- POLICIES: PROFILES
CREATE POLICY "Profiles readable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- POLICIES: WORKSPACES
CREATE POLICY "Workspaces readable by workspace members or super admins" ON public.workspaces FOR SELECT TO authenticated USING (public.is_workspace_member(id) OR public.is_super_admin());
CREATE POLICY "Users can insert workspaces" ON public.workspaces FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Workspace admins can update workspace" ON public.workspaces FOR UPDATE TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.workspace_members 
        WHERE workspace_id = id AND user_id = auth.uid() AND role IN ('workspace_owner', 'workspace_admin')
    )
);

-- POLICIES: WORKSPACE MEMBERS
CREATE POLICY "Members readable by workspace teammates or super admins" ON public.workspace_members FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id) OR public.is_super_admin());
CREATE POLICY "Admins can invite or manage workspace members" ON public.workspace_members FOR ALL TO authenticated USING (
    user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.workspace_members 
        WHERE workspace_id = public.workspace_members.workspace_id AND user_id = auth.uid() AND role IN ('workspace_owner', 'workspace_admin')
    )
);

-- POLICIES: FEEDBACK POSTS
CREATE POLICY "Feedback readable by workspace members or super admins" ON public.feedback_posts FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id) OR public.is_super_admin());
CREATE POLICY "Members can insert feedback" ON public.feedback_posts FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id) AND author_id = auth.uid());
CREATE POLICY "Authors or admins can update feedback" ON public.feedback_posts FOR UPDATE TO authenticated USING (
    author_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.workspace_members 
        WHERE workspace_id = public.feedback_posts.workspace_id AND user_id = auth.uid() AND role IN ('workspace_owner', 'workspace_admin')
    )
);

-- POLICIES: FEEDBACK VOTES
CREATE POLICY "Feedback votes readable by workspace members" ON public.feedback_votes FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.feedback_posts fp WHERE fp.id = post_id AND public.is_workspace_member(fp.workspace_id)
    )
);
CREATE POLICY "Users can insert own upvotes" ON public.feedback_votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own upvotes" ON public.feedback_votes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- POLICIES: SUBSCRIPTIONS
CREATE POLICY "Subscriptions readable by workspace members" ON public.subscriptions FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id) OR public.is_super_admin());

-- POLICIES: AUDIT LOGS
CREATE POLICY "Audit logs readable by workspace admins or super admins" ON public.audit_logs FOR SELECT TO authenticated USING (
    public.is_super_admin() OR EXISTS (
        SELECT 1 FROM public.workspace_members 
        WHERE workspace_id = public.audit_logs.workspace_id AND user_id = auth.uid() AND role IN ('workspace_owner', 'workspace_admin')
    )
);

-- POLICIES: FEATURE FLAGS
CREATE POLICY "Feature flags readable by authenticated users" ON public.feature_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admins can manage feature flags" ON public.feature_flags FOR ALL TO authenticated USING (public.is_super_admin());
