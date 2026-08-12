import { SystemRole, WorkspaceMember, WorkspaceRole } from '@template/types';

export const isSuperAdmin = (role?: SystemRole | null): boolean => {
  return role === 'super_admin';
};

export const isWorkspaceOwner = (memberRole?: WorkspaceRole | null): boolean => {
  return memberRole === 'workspace_owner';
};

export const isWorkspaceAdmin = (memberRole?: WorkspaceRole | null): boolean => {
  return memberRole === 'workspace_owner' || memberRole === 'workspace_admin';
};

export const isWorkspaceMember = (memberRole?: WorkspaceRole | null): boolean => {
  return !!memberRole;
};

export const canManageBilling = (memberRole?: WorkspaceRole | null): boolean => {
  return memberRole === 'workspace_owner';
};

export const canManageMembers = (memberRole?: WorkspaceRole | null): boolean => {
  return memberRole === 'workspace_owner' || memberRole === 'workspace_admin';
};

export const canModerateFeedback = (
  systemRole?: SystemRole | null,
  memberRole?: WorkspaceRole | null
): boolean => {
  if (isSuperAdmin(systemRole)) return true;
  return isWorkspaceAdmin(memberRole);
};

export interface PermissionContext {
  userId: string;
  systemRole: SystemRole;
  currentMember?: WorkspaceMember | null;
}

export const assertPermission = (
  condition: boolean,
  errorMessage: string = 'Permission denied'
): void => {
  if (!condition) {
    throw new Error(`[FORBIDDEN] ${errorMessage}`);
  }
};
