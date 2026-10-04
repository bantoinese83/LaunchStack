'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { ProfileService, WorkspaceService } from '@template/api';
import type { Profile, Workspace } from '@template/types';
import { firstZodIssueMessage, updateWorkspaceSchema } from '@template/validation';
import {
  getBrowserSupabaseClient,
  requireBrowserSessionOrRedirect,
} from '@/lib/supabase/browser-session';

const WORKSPACE_STORAGE_KEY = 'launchstack:selected-workspace-id';

type AppWorkspaceContextValue = {
  profile: Profile | null;
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  selectWorkspace: (ws: Workspace) => void;
  isAppLoading: boolean;
  isWorkspaceSwitching: boolean;
  wsName: string;
  setWsName: (name: string) => void;
  wsLogoUrl: string;
  setWsLogoUrl: (url: string) => void;
  updateWorkspaceSettings: (input: { name?: string; logoUrl?: string | null }) => Promise<void>;
  patchProfile: (patch: Partial<Profile>) => void;
  isPageDataLoading: boolean;
  setPageDataLoading: (loading: boolean) => void;
};

const AppWorkspaceContext = createContext<AppWorkspaceContextValue | null>(null);

export function AppWorkspaceProvider({
  children,
  initialProfile = null,
  initialWorkspaces = [],
}: {
  children: ReactNode;
  initialProfile?: Profile | null;
  initialWorkspaces?: Workspace[];
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    initialWorkspaces[0] ?? null
  );
  const [isAppLoading, setIsAppLoading] = useState(!initialProfile);
  const [isWorkspaceSwitching, setIsWorkspaceSwitching] = useState(false);
  const [wsName, setWsName] = useState('');
  const [wsLogoUrl, setWsLogoUrl] = useState('');
  const [isPageDataLoading, setPageDataLoading] = useState(false);
  const selectedWorkspaceIdRef = useRef<string | null>(null);

  const applyWorkspaceSelection = useCallback((ws: Workspace) => {
    selectedWorkspaceIdRef.current = ws.id;
    setSelectedWorkspace(ws);
    setWsName(ws.name);
    setWsLogoUrl(ws.logo_url ?? '');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(WORKSPACE_STORAGE_KEY, ws.id);
    }
  }, []);

  const selectWorkspace = useCallback(
    (ws: Workspace) => {
      if (selectedWorkspaceIdRef.current === ws.id) {
        return;
      }
      setIsWorkspaceSwitching(true);
      applyWorkspaceSelection(ws);
      setIsWorkspaceSwitching(false);
    },
    [applyWorkspaceSelection]
  );

  const patchProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const updateWorkspaceSettings = useCallback(
    async (input: { name?: string; logoUrl?: string | null }) => {
      if (!selectedWorkspace) {
        throw new Error('No workspace selected');
      }

      const parsed = updateWorkspaceSchema.safeParse({
        name: input.name,
        logoUrl: input.logoUrl,
      });
      if (!parsed.success) {
        throw new Error(firstZodIssueMessage(parsed.error));
      }

      const workspaceService = new WorkspaceService(getBrowserSupabaseClient());
      const updated = await workspaceService.updateWorkspace(selectedWorkspace.id, {
        name: parsed.data.name,
        logoUrl: parsed.data.logoUrl,
      });

      applyWorkspaceSelection(updated);
      setWorkspaces((prev) =>
        prev.map((workspace) => (workspace.id === updated.id ? updated : workspace))
      );
    },
    [applyWorkspaceSelection, selectedWorkspace]
  );

  useEffect(() => {
    async function loadAppWorkspace() {
      try {
        if (initialProfile) {
          if (initialWorkspaces.length === 0) {
            router.push('/onboarding');
            return;
          }
          const storedId =
            typeof window !== 'undefined' ? sessionStorage.getItem(WORKSPACE_STORAGE_KEY) : null;
          const initial =
            initialWorkspaces.find((ws) => ws.id === storedId) ?? initialWorkspaces[0] ?? null;
          if (initial) {
            applyWorkspaceSelection(initial);
          }
          return;
        }

        const auth = await requireBrowserSessionOrRedirect(router);
        if (!auth) return;

        const workspaceService = new WorkspaceService(auth.supabase);
        const profileService = new ProfileService(auth.supabase);
        const [userWorkspaces, profileData] = await Promise.all([
          workspaceService.getUserWorkspaces(auth.user.id),
          profileService.getProfile(auth.user.id),
        ]);

        setProfile(profileData);
        setWorkspaces(userWorkspaces);

        if (userWorkspaces.length === 0) {
          router.push('/onboarding');
          return;
        }

        const storedId =
          typeof window !== 'undefined' ? sessionStorage.getItem(WORKSPACE_STORAGE_KEY) : null;
        const initial =
          userWorkspaces.find((ws) => ws.id === storedId) ?? userWorkspaces[0] ?? null;
        if (initial) {
          applyWorkspaceSelection(initial);
        }
      } catch (err) {
        console.error('[AppWorkspace] Failed to load workspace context', err);
      } finally {
        setIsAppLoading(false);
      }
    }

    void loadAppWorkspace();
  }, [applyWorkspaceSelection, initialProfile, initialWorkspaces, router]);

  return (
    <AppWorkspaceContext.Provider
      value={{
        profile,
        workspaces,
        selectedWorkspace,
        selectWorkspace,
        isAppLoading,
        isWorkspaceSwitching,
        wsName,
        setWsName,
        wsLogoUrl,
        setWsLogoUrl,
        updateWorkspaceSettings,
        patchProfile,
        isPageDataLoading,
        setPageDataLoading,
      }}
    >
      {children}
    </AppWorkspaceContext.Provider>
  );
}

export function useAppWorkspace() {
  const ctx = useContext(AppWorkspaceContext);
  if (!ctx) {
    throw new Error('useAppWorkspace must be used within AppWorkspaceProvider');
  }
  return ctx;
}
