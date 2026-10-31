import { useCallback, useEffect, useState } from 'react';
import { fetchStudioAccess } from '../lib/studioApi';

export function useStudioAccess() {
  const [isManager, setIsManager] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStudioAccess();
      setIsManager(Boolean(data.allowed));
      setWorkspaceId(data.workspaceId ?? null);
    } catch {
      // Keep last-known access on transient errors so manager tabs do not flicker off.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { isManager, workspaceId, loading, refresh };
}
