-- Referrals ledger inserts must go through service role / studio APIs, not open client inserts.
DROP POLICY IF EXISTS mystic_referrals_insert ON public.mystic_referrals;

CREATE POLICY mystic_referrals_insert ON public.mystic_referrals
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = mystic_referrals.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('workspace_owner', 'workspace_admin')
    )
  );

CREATE POLICY mystic_referrals_update ON public.mystic_referrals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = mystic_referrals.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('workspace_owner', 'workspace_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = mystic_referrals.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('workspace_owner', 'workspace_admin')
    )
  );
