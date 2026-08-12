'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input } from '@template/ui';
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
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <Card className="w-full max-w-lg p-8 border-slate-800">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Step 1 of 2
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Create Your Workspace</h1>
          <p className="text-slate-400 text-sm mt-1">
            Workspaces isolate team data, members, and billing.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-950/80 border border-red-800/60 p-3 text-xs text-red-300 text-center">
            {error}
          </div>
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
