import { InvitableWorkspaceRole } from './workspace';

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  email: string;
  role: InvitableWorkspaceRole;
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface ConsentRecord {
  user_id: string;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  updated_at: string;
}
