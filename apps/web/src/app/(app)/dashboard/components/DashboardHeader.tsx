import React, { useState } from 'react';
import { Badge, Button } from '@template/ui';
import { Workspace } from '@template/types';
import { Check, Copy, Settings, UserPlus } from 'lucide-react';

interface DashboardHeaderProps {
  selectedWorkspace: Workspace | null;
  onShowSettings: () => void;
  onShowInvite: () => void;
  showToast: (msg: string) => void;
}

export function DashboardHeader({
  selectedWorkspace,
  onShowSettings,
  onShowInvite,
  showToast,
}: DashboardHeaderProps) {
  const [copiedSlug, setCopiedSlug] = useState(false);

  const handleCopySlug = async () => {
    if (!selectedWorkspace) return;
    try {
      await navigator.clipboard.writeText(selectedWorkspace.slug);
      setCopiedSlug(true);
      showToast('Workspace slug copied');
      setTimeout(() => setCopiedSlug(false), 2000);
    } catch {
      showToast('Could not copy slug');
    }
  };

  return (
    <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            {selectedWorkspace?.name}
          </h1>
          <Badge variant="success">Pro Active</Badge>
          <button
            type="button"
            onClick={handleCopySlug}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-muted transition-colors hover:border-ink/30 hover:text-ink"
          >
            {copiedSlug ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            {selectedWorkspace?.slug}
          </button>
        </div>
        <p className="mt-1.5 text-sm text-muted">
          Manage team seats, customer roadmap, and Stripe entitlements.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onShowSettings} className="gap-1.5">
          <Settings className="h-4 w-4" /> Settings
        </Button>
        <Button variant="primary" size="sm" onClick={onShowInvite} className="gap-1.5">
          <UserPlus className="h-4 w-4" /> Invite
        </Button>
      </div>
    </header>
  );
}
