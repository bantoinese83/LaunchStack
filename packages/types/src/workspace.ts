import { Profile } from './user';

export const WORKSPACE_ROLES = ['workspace_owner', 'workspace_admin', 'workspace_member'] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

/** Roles that can be assigned via invite (owners are created with the workspace). */
export const INVITABLE_WORKSPACE_ROLES = ['workspace_admin', 'workspace_member'] as const;
export type InvitableWorkspaceRole = (typeof INVITABLE_WORKSPACE_ROLES)[number];

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}
