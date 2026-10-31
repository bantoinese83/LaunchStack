import { MYSTIC_DEFAULT_WORKSPACE_ID } from '@template/mystic';

/** Mystic Hair workspace id — set after Supabase seed / Luke workspace create. */
export function getMysticWorkspaceId(): string {
  return process.env.NEXT_PUBLIC_MYSTIC_WORKSPACE_ID ?? MYSTIC_DEFAULT_WORKSPACE_ID;
}
