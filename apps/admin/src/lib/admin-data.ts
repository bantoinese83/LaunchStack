import { createSupabaseAdminClient } from '@template/api';
import type { AuditLog, Profile, Workspace } from '@template/types';

export type AdminWorkspaceRow = Workspace & {
  member_count: number;
  owner_email: string | null;
  subscription_status: string | null;
};

export type AdminOverview = {
  workspaceCount: number;
  userCount: number;
  activeSubscriptions: number;
  auditCount: number;
};

export async function loadAdminDashboard() {
  const admin = createSupabaseAdminClient();

  const [
    { data: workspaces },
    { count: userCount },
    { data: subscriptions },
    { data: auditLogs },
    { data: users },
    { data: members },
  ] = await Promise.all([
    admin.from('workspaces').select('*').order('created_at', { ascending: false }).limit(50),
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('subscriptions').select('workspace_id, status'),
    admin
      .from('audit_logs')
      .select('*, actor:profiles(*)')
      .order('created_at', { ascending: false })
      .limit(20),
    admin.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
    admin.from('workspace_members').select('workspace_id, role, user_id, profile:profiles(email)'),
  ]);

  const memberCountByWorkspace = new Map<string, number>();
  const ownerEmailByWorkspace = new Map<string, string>();
  for (const member of members ?? []) {
    memberCountByWorkspace.set(
      member.workspace_id,
      (memberCountByWorkspace.get(member.workspace_id) ?? 0) + 1
    );
    if (member.role === 'workspace_owner') {
      const profile = member.profile as { email?: string } | { email?: string }[] | null;
      const email = Array.isArray(profile) ? profile[0]?.email : profile?.email;
      if (email) ownerEmailByWorkspace.set(member.workspace_id, email);
    }
  }

  const statusByWorkspace = new Map(
    (subscriptions ?? []).map((row) => [row.workspace_id as string, row.status as string])
  );

  const workspaceRows: AdminWorkspaceRow[] = ((workspaces ?? []) as Workspace[]).map(
    (workspace) => ({
      ...workspace,
      member_count: memberCountByWorkspace.get(workspace.id) ?? 0,
      owner_email: ownerEmailByWorkspace.get(workspace.id) ?? null,
      subscription_status: statusByWorkspace.get(workspace.id) ?? null,
    })
  );

  const overview: AdminOverview = {
    workspaceCount: workspaces?.length ?? 0,
    userCount: userCount ?? 0,
    activeSubscriptions: (subscriptions ?? []).filter((row) => row.status === 'active').length,
    auditCount: auditLogs?.length ?? 0,
  };

  return {
    overview,
    workspaces: workspaceRows,
    users: (users ?? []) as Profile[],
    auditLogs: (auditLogs ?? []) as AuditLog[],
  };
}
