import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient, WorkspaceService } from '@template/api';
import { createWorkspaceSchema } from '@template/validation';
import { analytics } from '@template/analytics';

export function useOnboarding() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    );
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = createWorkspaceSchema.safeParse({ name, slug });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/login');
        return;
      }

      const workspaceService = new WorkspaceService(supabase);
      const workspace = await workspaceService.createWorkspace(session.user.id, name, slug);

      analytics.track(
        {
          name: 'workspace_created',
          properties: { workspace_id: workspace.id, workspace_name: name, slug },
        },
        session.user.id
      );

      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace');
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
