'use client';

import React, { useState } from 'react';
import { Toast, Skeleton } from '@template/ui';
import { useDashboardData } from './hooks/useDashboardData';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardStats } from './components/DashboardStats';
import { MembersTable } from './components/MembersTable';
import { InviteModal } from './components/InviteModal';
import { SettingsModal } from './components/SettingsModal';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const {
    profile,
    workspaces,
    selectedWorkspace,
    setSelectedWorkspace,
    members,
    isLoading,
    wsName,
    setWsName,
  } = useDashboardData();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}

      <DashboardSidebar
        profile={profile}
        workspaces={workspaces}
        selectedWorkspace={selectedWorkspace}
        onWorkspaceSelect={(ws) => {
          setSelectedWorkspace(ws);
          setWsName(ws.name);
        }}
      />

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {isLoading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DashboardHeader
              selectedWorkspace={selectedWorkspace}
              onShowSettings={() => setShowSettingsModal(true)}
              onShowInvite={() => setShowInviteModal(true)}
              showToast={showToast}
            />

            <DashboardStats members={members} />

            <MembersTable members={members} onShowInvite={() => setShowInviteModal(true)} />
          </motion.div>
        )}

        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          selectedWorkspace={selectedWorkspace}
          profile={profile}
          showToast={showToast}
        />

        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          selectedWorkspace={selectedWorkspace}
          wsName={wsName}
          setWsName={setWsName}
          showToast={showToast}
        />
      </main>
    </div>
  );
}
