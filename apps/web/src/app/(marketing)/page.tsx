'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Badge } from '@template/ui';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';

export default function MarketingLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does multi-tenancy work?',
      a: 'Every tenant table carries a workspace_id. PostgreSQL Row Level Security checks membership on every query — zero client trust.',
    },
    {
      q: 'Can I ship to the App Store and Play Store?',
      a: 'Yes. The mobile app uses Expo Router. Build with EAS and submit to both stores.',
    },
    {
      q: 'Is Stripe billing production-ready?',
      a: 'Checkout sessions, portal redirects, and fail-closed webhook signature verification are included.',
    },
    {
      q: 'What transactional email is included?',
      a: 'Welcome, invites, password reset, and feedback status templates ship in @template/email with HTML escaping.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink atlas-grain">
      <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-ink font-display text-sm font-bold text-paper transition-transform duration-200 group-hover:-rotate-3">
              LS
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">LaunchStack</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#platform" className="hover:text-ink transition-colors">
              Platform
            </a>
            <a href="#pricing" className="hover:text-ink transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-ink transition-colors">
              FAQ
            </a>
            <Link href="/privacy" className="hover:text-ink transition-colors">
              Privacy
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm">
                Start building
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — brand, headline, support, CTA, product visual */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-y-0 right-0 hidden w-[48%] bg-ink md:block" aria-hidden />
        <div
          className="absolute inset-y-0 right-0 hidden w-[48%] md:block"
          style={{
            backgroundImage:
              'linear-gradient(135deg, transparent 0%, transparent 48%, rgba(15,110,86,0.35) 48%, rgba(15,110,86,0.35) 50%, transparent 50%)',
          }}
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1fr_1.05fr] md:py-20 lg:py-24">
          <div className="animate-[rise_500ms_ease-out]">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
              LaunchStack
            </p>
            <div className="atlas-rule mt-5 mb-7 w-16 bg-accent" style={{ height: 3 }} />
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-[3.5rem] text-balance">
              Ship the product.
              <br />
              Not the scaffolding.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg">
              A typed monorepo for B2B SaaS and native apps — shared auth, billing, and RLS from day
              one.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Open the template <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#platform">
                <Button variant="outline" size="lg">
                  See the stack
                </Button>
              </a>
            </div>
          </div>

          <aside className="relative flex justify-center md:min-h-[420px] md:justify-end md:pl-4">
            <div className="relative flex w-full max-w-[420px] items-end justify-center gap-3 sm:gap-4 md:max-w-none md:justify-end">
              <figure
                className="relative z-10 w-[46%] max-w-[200px] animate-[rise_600ms_ease-out] md:w-[48%] md:max-w-[220px]"
                style={{ animationDelay: '80ms' }}
              >
                <div className="overflow-hidden rounded-[1.35rem] border-[3px] border-ink bg-ink shadow-[0_24px_48px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/10 md:border-paper/20">
                  <Image
                    src="/marketing/signin-ios.png"
                    alt="LaunchStack sign-in on iPhone"
                    width={470}
                    height={1024}
                    className="h-auto w-full"
                    priority
                  />
                </div>
                <figcaption className="mt-3 text-center font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted md:text-paper/55">
                  iOS
                </figcaption>
              </figure>

              <figure
                className="relative z-0 mb-6 w-[46%] max-w-[200px] animate-[rise_700ms_ease-out] md:mb-10 md:w-[48%] md:max-w-[220px]"
                style={{ animationDelay: '160ms' }}
              >
                <div className="overflow-hidden rounded-[1.1rem] border-[3px] border-ink bg-ink shadow-[0_24px_48px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/10 md:border-paper/20">
                  <Image
                    src="/marketing/signin-android.png"
                    alt="LaunchStack sign-in on Android"
                    width={460}
                    height={1024}
                    className="h-auto w-full"
                    priority
                  />
                </div>
                <figcaption className="mt-3 text-center font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted md:text-paper/55">
                  Android
                </figcaption>
              </figure>
            </div>
          </aside>
        </div>
      </section>

      <section id="platform" className="border-b border-line py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Architecture that survives first customers
            </h2>
            <p className="mt-4 text-muted leading-relaxed">
              Not a feature grid of promises — the seams teams actually hit when shipping
              multi-tenant software.
            </p>
          </div>

          <div className="mt-14 grid gap-px bg-line md:grid-cols-2">
            {[
              {
                title: 'Workspace isolation',
                body: 'PostgreSQL RLS on every tenant table. Membership checks live in the database, not in hopeful client filters.',
              },
              {
                title: 'Shared domain packages',
                body: 'Roles, validation enums, and API helpers live once in packages/ — web, admin, and mobile import the same contracts.',
              },
              {
                title: 'Billing that fails closed',
                body: 'Stripe webhooks verify signatures in production. Missing secrets return 500 instead of accepting forged events.',
              },
              {
                title: 'Native sessions',
                body: 'Expo SecureStore for tokens, Expo Router for navigation, and the same Zod schemas as the web app.',
              },
            ].map((item) => (
              <article key={item.title} className="bg-paper p-8 md:p-10">
                <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b border-line py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Pricing
              </h2>
              <p className="mt-3 text-muted">Start free. Upgrade when the workspace grows.</p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-[1fr_1.1fr]">
            <div className="rounded-md border border-line bg-surface p-8">
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
            </div>

            <div className="rounded-md border border-ink bg-ink p-8 text-paper">
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
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {t}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-8 block">
                <Button className="w-full bg-accent hover:bg-accent-hover">Start trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Questions</h2>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {faqs.map((faq, idx) => (
              <button
                key={faq.q}
                type="button"
                className="flex w-full flex-col py-5 text-left"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <span className="flex items-center justify-between gap-4">
                  <span className="font-display text-lg font-semibold tracking-tight">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`}
                  />
                </span>
                {openFaq === idx && (
                  <span className="mt-3 pr-8 text-sm leading-relaxed text-muted">{faq.a}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-line bg-surface py-10 text-sm text-muted">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-ink font-display text-[10px] font-bold text-paper">
              LS
            </span>
            <span className="font-medium text-ink">LaunchStack</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
          </div>
          <p>© 2026 LaunchStack</p>
        </div>
      </footer>
    </div>
  );
}
