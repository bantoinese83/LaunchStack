import React, { useState } from 'react';
import { Alert, Button, Input, Modal, fieldSelectClassName } from '@template/ui';
import {
  Workspace,
  Profile,
  InvitableWorkspaceRole,
  INVITABLE_WORKSPACE_ROLES,
} from '@template/types';
import { inviteMemberSchema } from '@template/validation';

const INVITE_ROLE_LABELS: Record<InvitableWorkspaceRole, string> = {
  workspace_member: 'Workspace Member',
  workspace_admin: 'Workspace Admin',
};

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWorkspace: Workspace | null;
  profile: Profile | null;
  showToast: (msg: string) => void;
}

export function InviteModal({
  isOpen,
  onClose,
  selectedWorkspace,
  profile,
  showToast,
}: InviteModalProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<InvitableWorkspaceRole>('workspace_member');
  const [modalError, setModalError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  const handleClose = () => {
    onClose();
    setModalError(null);
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const validation = inviteMemberSchema.safeParse({ email: inviteEmail, role: inviteRole });
    if (!validation.success) {
      setModalError(validation.error.issues[0].message);
      return;
    }

    try {
      if (!selectedWorkspace || !profile) return;
      setInviteLoading(true);

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const inviteUrl = `${origin}/login?invite=${selectedWorkspace.id}`;
      const response = await fetch('/api/email/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: inviteEmail,
          inviterName: profile.full_name || profile.email,
          workspaceName: selectedWorkspace.name,
          inviteUrl,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || 'Failed to send invite');
      }

      handleClose();
      setInviteEmail('');
      showToast(`Invitation sent to ${inviteEmail}`);
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite team member"
      description="Send an email invitation powered by Brevo."
    >
      {modalError && (
        <Alert className="mb-4" variant="error">
          {modalError}
        </Alert>
      )}
      <form onSubmit={handleInviteMember} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="colleague@example.com"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          required
        />
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Role
          </label>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as InvitableWorkspaceRole)}
            className={fieldSelectClassName}
          >
            {INVITABLE_WORKSPACE_ROLES.map((role) => (
              <option key={role} value={role}>
                {INVITE_ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={inviteLoading}>
            Send invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
