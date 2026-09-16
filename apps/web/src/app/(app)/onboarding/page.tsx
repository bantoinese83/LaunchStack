'use client';

import React from 'react';
import { Alert, BrandMark, Button, Card, Input } from '@template/ui';
import { useOnboarding } from './useOnboarding';

export default function OnboardingPage() {
  const { name, handleNameChange, slug, setSlug, error, isLoading, handleOnboarding } =
    useOnboarding();

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

        <form onSubmit={handleOnboarding} className="space-y-5">
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
