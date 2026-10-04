-- Invites, consent, GDPR export requests, storage, and upvote integrity.

CREATE TABLE IF NOT EXISTS public.workspace_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'workspace_member'
      CHECK (role IN ('workspace_admin', 'workspace_member')),
    token TEXT UNIQUE NOT NULL,
    invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_workspace_invites_workspace ON public.workspace_invites(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invites_email ON public.workspace_invites(email);

CREATE TABLE IF NOT EXISTS public.consent_records (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    necessary BOOLEAN NOT NULL DEFAULT true,
    analytics BOOLEAN NOT NULL DEFAULT false,
    marketing BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.data_export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'failed')),
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invites readable by workspace admins or invitee"
  ON public.workspace_invites FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR invited_by = auth.uid()
    OR public.is_workspace_member(workspace_id)
    OR email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Workspace admins can create invites"
  ON public.workspace_invites FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = public.workspace_invites.workspace_id
        AND user_id = auth.uid()
        AND role IN ('workspace_owner', 'workspace_admin')
    )
  );

CREATE POLICY "Users manage own consent"
  ON public.consent_records FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own export requests"
  ON public.data_export_requests FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.accept_workspace_invite(p_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_row public.workspace_invites;
  membership_id UUID;
BEGIN
  SELECT * INTO invite_row
  FROM public.workspace_invites
  WHERE token = p_token
    AND accepted_at IS NULL
    AND expires_at > timezone('utc'::text, now())
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite is invalid or expired';
  END IF;

  IF invite_row.email <> (SELECT email FROM public.profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Invite email does not match the signed-in user';
  END IF;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (invite_row.workspace_id, auth.uid(), invite_row.role)
  ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = EXCLUDED.role
  RETURNING id INTO membership_id;

  UPDATE public.workspace_invites
  SET accepted_at = timezone('utc'::text, now())
  WHERE id = invite_row.id;

  RETURN invite_row.workspace_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_feedback_upvote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feedback_posts SET upvotes_count = upvotes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feedback_posts SET upvotes_count = GREATEST(upvotes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS feedback_votes_upvote_count ON public.feedback_votes;
CREATE TRIGGER feedback_votes_upvote_count
  AFTER INSERT OR DELETE ON public.feedback_votes
  FOR EACH ROW EXECUTE FUNCTION public.sync_feedback_upvote_count();

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
