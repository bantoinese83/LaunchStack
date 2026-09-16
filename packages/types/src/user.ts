export const SYSTEM_ROLES = ['user', 'super_admin'] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  system_role: SystemRole;
  created_at: string;
  updated_at: string;
}
