'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Badge, Button } from '@template/ui';
import { Subscription, Workspace } from '@template/types';
import { Check, Copy, CreditCard, Settings, UserPlus } from 'lucide-react';
import { authorizedFetch } from '@/lib/api/authorized-fetch';
import { readApiError } from '@/lib/api/read-api-error';

interface DashboardHeaderProps {
  selectedWorkspace: Workspace | null;
  subscription: Subscription | null;
  onShowSettings: () => void;
  onShowInvite: () => void;
  showToast: (msg: string) => void;
}

export function DashboardHeader({
  selectedWorkspace,
  subscription,
  onShowSettings,
  onShowInvite,
  showToast,
}: DashboardHeaderProps) {
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  const openBilling = async (path: '/api/stripe/checkout' | '/api/stripe/portal', body: object) => {
    if (!selectedWorkspace) return;
    setBillingLoading(true);
    try {
      const response = await authorizedFetch(path, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(await readApiError(response, 'Billing request failed'));
      }
      const payload = (await response.json()) as { url?: string };
      if (payload.url) {
        window.location.assign(payload.url);
        return;
      }
      showToast('Billing session created');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Billing request failed');
    } finally {
      setBillingLoading(false);
    }
  };

  const handleCopySlug = async () => {
    if (!selectedWorkspace) return;
    try {
      await navigator.clipboard.writeText(selectedWorkspace.slug);
      setCopiedSlug(true);
      showToast('Workspace slug copied');
      setTimeout(() => setCopiedSlug(false), 2000);
    } catch {
      showToast('Could not copy slug');
    }
  };

  return (
    <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          {selectedWorkspace?.logo_url ? (
            <Image
              src={selectedWorkspace.logo_url}
              alt=""
              width={36}
              height={36}
              unoptimized
              className="rounded-md border border-line object-cover"
              style={{ width: 36, height: 36 }}
            />
          ) : null}
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            {selectedWorkspace?.name}
          </h1>
          <Badge variant={subscription?.status === 'active' ? 'success' : 'info'}>
            {subscription?.status === 'active' ? 'Pro Active' : 'Free'}
          </Badge>
          <button
            type="button"
            onClick={handleCopySlug}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-muted transition-colors hover:border-ink/30 hover:text-ink"
          >
            {copiedSlug ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            {selectedWorkspace?.slug}
          </button>
        </div>
        <p className="mt-1.5 text-sm text-muted">
          Manage team seats, customer roadmap, and Stripe entitlements.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {subscription?.status === 'active' || selectedWorkspace?.stripe_customer_id ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            isLoading={billingLoading}
            onClick={() =>
              void openBilling('/api/stripe/portal', { workspaceId: selectedWorkspace?.id })
            }
          >
            <CreditCard className="h-4 w-4" /> Billing portal
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            isLoading={billingLoading}
            onClick={() =>
              void openBilling('/api/stripe/checkout', {
                workspaceId: selectedWorkspace?.id,
                priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_launchstack_pro',
              })
            }
          >
            <CreditCard className="h-4 w-4" /> Checkout
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onShowSettings} className="gap-1.5">
          <Settings className="h-4 w-4" /> Settings
        </Button>
        <Button variant="primary" size="sm" onClick={onShowInvite} className="gap-1.5">
          <UserPlus className="h-4 w-4" /> Invite
        </Button>
      </div>
    </header>
  );
}
