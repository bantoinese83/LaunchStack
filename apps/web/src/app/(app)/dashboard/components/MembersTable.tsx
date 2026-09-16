import React from 'react';
import { Avatar, Badge, Button, Card, EmptyState } from '@template/ui';
import { WorkspaceMember } from '@template/types';
import { isWorkspaceOwner } from '@template/auth';
import { motion } from 'framer-motion';

interface MembersTableProps {
  members: WorkspaceMember[];
  onShowInvite: () => void;
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

export function MembersTable({ members, onShowInvite }: MembersTableProps) {
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

        {members.length === 0 ? (
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
                      <Badge variant={isWorkspaceOwner(mem.role) ? 'purple' : 'info'}>
                        {mem.role.replaceAll('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-muted">
                      {new Date(mem.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
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
