'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Badge } from '@template/ui';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { authorizedFetch } from '@/lib/api/authorized-fetch';
import { readApiError } from '@/lib/api/read-api-error';
import { getBrowserSupabaseClient } from '@/lib/supabase/browser-session';
import { WorkspaceService } from '@template/api';

export const PricingSection = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = getBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/signup?next=/dashboard');
        return;
      }
      const workspaces = await new WorkspaceService(supabase).getUserWorkspaces(user.id);
      const workspace = workspaces[0];
      if (!workspace) {
        router.push('/onboarding');
        return;
      }
      const response = await authorizedFetch('/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          workspaceId: workspace.id,
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_launchstack_pro',
        }),
      });
      if (!response.ok) throw new Error(await readApiError(response, 'Checkout failed'));
      const payload = (await response.json()) as { url?: string };
      if (payload.url) {
        window.location.assign(payload.url);
        return;
      }
      throw new Error('Checkout did not return a URL');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="border-b border-line py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-xl"
        >
          <p className="type-eyebrow text-accent">Pricing</p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Start free. Upgrade when the workspace grows.
          </h2>
        </motion.div>

        {error ? <p className="mt-6 text-sm text-danger">{error}</p> : null}

        <div className="mt-12 grid gap-6 md:grid-cols-[1fr_1.12fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-2xl border border-line bg-surface p-8 md:p-10"
          >
            <h3 className="font-display text-2xl font-semibold">Starter</h3>
            <p className="mt-1 text-sm text-muted">Evaluate the template locally.</p>
            <p className="mt-8 font-display text-4xl font-semibold tracking-tight">
              $0<span className="text-base font-sans font-normal text-muted"> / mo</span>
            </p>
            <ul className="mt-8 space-y-3 text-sm text-ink">
              {['3 workspace members', 'Web + mobile apps', 'Public feedback board'].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {t}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="mt-8 block">
              <Button variant="outline" className="w-full">
                Get started
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="rounded-2xl border border-shell/20 bg-shell p-8 text-paper shadow-[0_24px_60px_-32px_rgba(20,19,19,0.65)] md:p-10"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-2xl font-semibold">Pro Team</h3>
              <Badge className="border-white/20 bg-white/10 text-paper">Recommended</Badge>
            </div>
            <p className="mt-1 text-sm text-white/60">For commercial SaaS workspaces.</p>
            <p className="mt-8 font-display text-4xl font-semibold tracking-tight">
              $49<span className="text-base font-sans font-normal text-white/55"> / mo</span>
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                '20 workspace members',
                'Stripe subscription sync',
                'Unlimited feedback + votes',
                'Transactional email triggers',
                'Priority support path',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {t}
                </li>
              ))}
            </ul>
            <Button
              className="mt-8 w-full bg-accent hover:bg-accent-hover"
              isLoading={loading}
              onClick={() => void startCheckout()}
            >
              Start trial
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
