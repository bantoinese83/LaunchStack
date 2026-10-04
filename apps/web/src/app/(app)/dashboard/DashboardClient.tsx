'use client';

import React, { useState } from 'react';
import { Toast, Skeleton } from '@template/ui';
import type { Subscription, WorkspaceMember } from '@template/types';
import { useToast } from '@/hooks/useToast';
import { useDashboardData } from './hooks/useDashboardData';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardStats } from './components/DashboardStats';
import { MembersTable } from './components/MembersTable';
import { PendingInvites } from './components/PendingInvites';
import { InviteModal } from './components/InviteModal';
import { SettingsModal } from './components/SettingsModal';
import { motion } from 'framer-motion';

export function DashboardClient({
  initialWorkspaceId = null,
  initialMembers = [],
  initialFeedbackCount = 0,
  initialSubscription = null,
}: {
  initialWorkspaceId?: string | null;
  initialMembers?: WorkspaceMember[];
  initialFeedbackCount?: number;
  initialSubscription?: Subscription | null;
}) {
  const {
    profile,
    selectedWorkspace,
    members,
    feedbackCount,
    subscription,
    isLoading,
    isMembersLoading,
    wsName,
    setWsName,
    wsLogoUrl,
    setWsLogoUrl,
    saveWorkspaceSettings,
    refreshMembers,
  } = useDashboardData({
    initialWorkspaceId,
    initialMembers,
    initialFeedbackCount,
    initialSubscription,
  });

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { toastMessage, toastVariant, showToast, dismissToast } = useToast();

  return (
    <>
      {toastMessage && (
        <Toast message={toastMessage} variant={toastVariant} onDismiss={dismissToast} />
      )}

      <div className="p-6 md:p-8">
        {isLoading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DashboardHeader
              selectedWorkspace={selectedWorkspace}
              subscription={subscription}
              onShowSettings={() => setShowSettingsModal(true)}
              onShowInvite={() => setShowInviteModal(true)}
              showToast={showToast}
            />

            <DashboardStats
              members={members}
              feedbackCount={feedbackCount}
              subscription={subscription}
              planOverride={selectedWorkspace?.plan_override ?? null}
              isLoading={isMembersLoading}
            />

            <MembersTable
              members={members}
              workspaceId={selectedWorkspace?.id ?? null}
              isLoading={isMembersLoading}
              onShowInvite={() => setShowInviteModal(true)}
              onChanged={() => void refreshMembers()}
            />

            <PendingInvites
              workspaceId={selectedWorkspace?.id ?? null}
              refreshKey={members.length}
            />
          </motion.div>
        )}

        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          selectedWorkspace={selectedWorkspace}
          profile={profile}
          showToast={showToast}
          onInviteSent={() => void refreshMembers()}
        />

        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          selectedWorkspace={selectedWorkspace}
          wsName={wsName}
          setWsName={setWsName}
          wsLogoUrl={wsLogoUrl}
          setWsLogoUrl={setWsLogoUrl}
          onSave={saveWorkspaceSettings}
          showToast={showToast}
        />
      </div>
    </>
  );
}
