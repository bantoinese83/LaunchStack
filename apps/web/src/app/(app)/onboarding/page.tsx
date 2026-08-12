'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, BrandMark, Button, Card, Input } from '@template/ui';
import { createSupabaseBrowserClient, DomainAPI } from '@template/api';
import { createWorkspaceSchema } from '@template/validation';
import { analytics } from '@template/analytics';

export default function OnboardingPage() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = createWorkspaceSchema.safeParse({ name, slug });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
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

      const domainApi = new DomainAPI(supabase);
      const workspace = await domainApi.createWorkspace(session.user.id, name, slug);

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper atlas-grain p-6">
      <Card className="w-full max-w-lg p-8 animate-[rise_400ms_ease-out]">
        <div className="mb-8 text-center">
          <BrandMark className="mx-auto mb-4" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Step 1 of 1
          </p>
          <div className="mx-auto mt-3 mb-4 h-[3px] w-12 bg-accent" aria-hidden />
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Create your workspace
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Workspaces isolate team data, members, and billing.
          </p>
        </div>

        {error && (
          <Alert className="mb-6" variant="error">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="name"
            label="Workspace Name"
            placeholder="Acme Corp"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          <Input
            id="slug"
            label="Workspace URL Slug"
            placeholder="acme-corp"
            helperText="Used in invite links and tenant URLs"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Create Workspace & Launch
          </Button>
        </form>
      </Card>
    </div>
  );
}
