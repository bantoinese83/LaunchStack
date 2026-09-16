import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient, ProfileService, WorkspaceService } from '@template/api';
import { Workspace, Profile, WorkspaceMember } from '@template/types';

export function useDashboardData() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wsName, setWsName] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push('/login');
          return;
        }

        const user = session.user;
        const workspaceService = new WorkspaceService(supabase);
        const userWorkspaces = await workspaceService.getUserWorkspaces(user.id);
        const members =
          userWorkspaces.length > 0
            ? await workspaceService.getWorkspaceMembers(userWorkspaces[0].id)
            : [];

        const profileService = new ProfileService(supabase);
        const profileData = await profileService.getProfile(user.id);
        setProfile(profileData);
        setWorkspaces(userWorkspaces);

        if (userWorkspaces.length > 0) {
          const ws = userWorkspaces[0];
          setSelectedWorkspace(ws);
          setWsName(ws.name);
          const wsMembers = await workspaceService.getWorkspaceMembers(ws.id);
          setMembers(wsMembers);
        } else {
          router.push('/onboarding');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

  return {
    profile,
    workspaces,
    selectedWorkspace,
    setSelectedWorkspace,
    members,
    isLoading,
    wsName,
    setWsName,
  };
}
