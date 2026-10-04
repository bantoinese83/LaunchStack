'use client';

import React, { useState } from 'react';
import { Avatar, Badge, Button, Card, EmptyState, Skeleton } from '@template/ui';
import { WorkspaceMember, WORKSPACE_ROLES } from '@template/types';
import { isWorkspaceOwner } from '@template/auth';
import { motion } from 'framer-motion';
import { authorizedFetch } from '@/lib/api/authorized-fetch';
import { readApiError } from '@/lib/api/read-api-error';

interface MembersTableProps {
  members: WorkspaceMember[];
  workspaceId: string | null;
  isLoading?: boolean;
  onShowInvite: () => void;
  onChanged: () => void;
}

const tableContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const rowItem = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

export function MembersTable({
  members,
  workspaceId,
  isLoading = false,
  onShowInvite,
  onChanged,
}: MembersTableProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const changeRole = async (member: WorkspaceMember, role: WorkspaceMember['role']) => {
    if (!workspaceId || role === member.role) return;
    setPendingId(member.id);
    setError(null);
    try {
      const response = await authorizedFetch('/api/members', {
        method: 'PATCH',
        body: JSON.stringify({ memberId: member.id, workspaceId, role }),
      });
      if (!response.ok) throw new Error(await readApiError(response, 'Could not update role'));
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update role');
    } finally {
      setPendingId(null);
    }
  };

  const removeMember = async (member: WorkspaceMember) => {
    if (!workspaceId) return;
    if (!window.confirm(`Remove ${member.profile?.email || 'this member'} from the workspace?`)) {
      return;
    }
    setPendingId(member.id);
    setError(null);
    try {
      const response = await authorizedFetch(
        `/api/members?memberId=${member.id}&workspaceId=${workspaceId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error(await readApiError(response, 'Could not remove member'));
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove member');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: 'spring', damping: 25 }}
    >
      <Card className="border-line">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
            Workspace teammates
          </h2>
          <Button variant="outline" size="sm" onClick={onShowInvite}>
            Invite teammate
          </Button>
        </div>

        {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            title="No teammates yet"
            description="Invite your first collaborator to share this workspace."
            action={
              <Button size="sm" onClick={onShowInvite}>
                Invite member
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted">
              <thead className="border-b border-line text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="px-3 py-3">Member</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Joined</th>
                  <th className="px-3 py-3 text-right">Action</th>
                </tr>
              </thead>
              <motion.tbody
                variants={tableContainer}
                initial="hidden"
                animate="show"
                className="divide-y divide-line"
              >
                {members.map((mem) => (
                  <motion.tr
                    variants={rowItem}
                    key={mem.id}
                    className="transition-colors hover:bg-paper/70"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={mem.profile?.full_name || mem.profile?.email || 'User'}
                          src={mem.profile?.avatar_url}
                          size="sm"
                        />
                        <div>
                          <p className="font-semibold leading-none text-ink">
                            {mem.profile?.full_name || 'Member'}
                          </p>
                          <p className="mt-1 text-xs text-muted">{mem.profile?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {isWorkspaceOwner(mem.role) ? (
                        <Badge variant="purple">{mem.role.replaceAll('_', ' ')}</Badge>
                      ) : (
                        <select
                          className="rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink"
                          value={mem.role}
                          disabled={pendingId === mem.id}
                          onChange={(event) =>
                            void changeRole(mem, event.target.value as WorkspaceMember['role'])
                          }
                        >
                          {WORKSPACE_ROLES.filter((role) => role !== 'workspace_owner').map(
                            (role) => (
                              <option key={role} value={role}>
                                {role.replaceAll('_', ' ')}
                              </option>
                            )
                          )}
                        </select>
                      )}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-muted">
                      {new Date(mem.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {isWorkspaceOwner(mem.role) ? (
                        <span className="text-xs text-muted">Owner</span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          isLoading={pendingId === mem.id}
                          onClick={() => void removeMember(mem)}
                        >
                          Remove
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
