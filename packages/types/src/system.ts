import { Profile } from './user';

export interface AuditLog {
  id: string;
  workspace_id: string | null;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: Profile;
}

export interface FeatureFlag {
  id: string;
  key: string;
  description: string;
  enabled_globally: boolean;
  target_workspaces: string[];
  created_at: string;
}

export interface APIResult<T> {
  data: T | null;
  error: {
    message: string;
    code?: string;
  } | null;
}
