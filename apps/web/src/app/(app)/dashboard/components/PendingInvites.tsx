'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Card, EmptyState } from '@template/ui';
import type { WorkspaceInvite } from '@template/types';
import { authorizedFetch } from '@/lib/api/authorized-fetch';
import { readApiError } from '@/lib/api/read-api-error';

export function PendingInvites({
  workspaceId,
  refreshKey,
}: {
  workspaceId: string | null;
  refreshKey: number;
}) {
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    void (async () => {
      try {
        const response = await authorizedFetch(`/api/invites/list?workspaceId=${workspaceId}`);
        if (!response.ok) {
          throw new Error(await readApiError(response, 'Could not load invites'));
        }
        const payload = (await response.json()) as { invites: WorkspaceInvite[] };
        if (!cancelled) setInvites(payload.invites);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load invites');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, refreshKey]);

  const revoke = async (invite: WorkspaceInvite) => {
    if (!workspaceId) return;
    setPendingId(invite.id);
    setError(null);
    try {
      const response = await authorizedFetch(
        `/api/invites/list?inviteId=${invite.id}&workspaceId=${workspaceId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error(await readApiError(response, 'Could not revoke invite'));
      setInvites((current) => current.filter((row) => row.id !== invite.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not revoke invite');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <Card className="mt-6 border-line">
      <h2 className="mb-4 font-display text-lg font-semibold tracking-tight text-ink">
        Pending invites
      </h2>
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      {invites.length === 0 ? (
        <EmptyState
          title="No pending invites"
          description="New invites appear here until they are accepted or revoked."
        />
      ) : (
        <div className="space-y-3">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex flex-col gap-3 rounded-xl border border-line p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-ink">{invite.email}</p>
                <p className="mt-1 font-mono text-[11px] text-muted">
                  expires {new Date(invite.expires_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info">{invite.role.replaceAll('_', ' ')}</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={pendingId === invite.id}
                  onClick={() => void revoke(invite)}
                >
                  Revoke
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
