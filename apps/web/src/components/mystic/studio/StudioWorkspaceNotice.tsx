'use client';

import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { mysticCard } from '@/components/mystic/mystic-styles';

export function StudioWorkspaceNotice() {
  const workspaceId = getMysticWorkspaceId();
  if (workspaceId) return null;
  return (
    <p className={`${mysticCard} p-4 text-sm text-muted`} role="alert">
      Studio is not wired yet. Set{' '}
      <code className="rounded bg-paper px-1 text-ink">NEXT_PUBLIC_MYSTIC_WORKSPACE_ID</code> in{' '}
      <code className="rounded bg-paper px-1 text-ink">apps/web/.env.local</code> to your Mystic
      workspace UUID from Supabase.
    </p>
  );
}
