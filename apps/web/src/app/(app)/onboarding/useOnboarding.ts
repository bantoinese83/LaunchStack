'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorkspaceService } from '@template/api';
import {
  createWorkspaceSchema,
  firstZodIssueMessage,
  getErrorMessage,
  slugifyWorkspaceName,
} from '@template/validation';
import { analytics } from '@template/analytics';
import { requireBrowserSessionOrRedirect } from '@/lib/supabase/browser-session';

export function useOnboarding() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugifyWorkspaceName(val));
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = createWorkspaceSchema.safeParse({ name, slug });
    if (!validation.success) {
      setError(firstZodIssueMessage(validation.error));
      return;
    }

    setIsLoading(true);
    try {
      const auth = await requireBrowserSessionOrRedirect(router);
      if (!auth) return;

      const workspaceService = new WorkspaceService(auth.supabase);
      const workspace = await workspaceService.createWorkspace(auth.user.id, name, slug);

      analytics.track(
        {
          name: 'workspace_created',
          properties: { workspace_id: workspace.id, workspace_name: name, slug },
        },
        auth.user.id
      );

      router.push('/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to create workspace'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    name,
    handleNameChange,
    slug,
    setSlug,
    error,
    isLoading,
    handleOnboarding,
  };
}
