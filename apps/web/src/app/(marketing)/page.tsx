'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Badge, BrandMark } from '@template/ui';
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
      a: 'Yes. The mobile app uses Expo Router. Build with EAS and submit to both stores from the same monorepo.',
    },
    {
      q: 'Is Stripe billing production-ready?',
      a: 'Checkout sessions, portal redirects, and fail-closed webhook signature verification are included. Missing secrets return 500 in production.',
    },
    {
      q: 'What transactional email is included?',
      a: 'Welcome, invites, and status templates ship in @template/email with HTML escaping. Sends go through server routes so API keys never reach the browser.',
    },
    {
      q: 'Do web, admin, and mobile share types?',
      a: 'Roles, feedback enums, and Zod schemas live once in packages/. All three apps import the same contracts.',
    },
    {
      q: 'What do I need locally?',
      a: 'Node 22+, pnpm 9+, and Docker for Supabase. Copy .env.example, run pnpm db:start, then pnpm dev.',
    },
  ];

  const seams = [
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
  ];

  const surfaces = [
    {
      name: 'Web',
      stack: 'Next.js 16',
      copy: 'Marketing, auth, dashboard, feedback board, and Stripe checkout — App Router with typed packages.',
    },
    {
      name: 'Admin',
      stack: 'Next.js 16',
      copy: 'Internal portal for platform metrics, workspace inspection, and audit-style operations.',
    },
    {
      name: 'Mobile',
      stack: 'Expo 57',
      copy: 'iOS and Android with the same auth contracts, ready for EAS builds and store submission.',
    },
  ];

  const steps = [
    {
      n: '01',
      title: 'Clone the monorepo',
      body: 'pnpm install brings web, admin, mobile, and shared packages online together.',
    },
    {
      n: '02',
      title: 'Start local Supabase',
      body: 'pnpm db:start runs migrations, seeds demo data, and enforces RLS from the first query.',
    },
    {
      n: '03',
      title: 'Ship a real surface',
      body: 'pnpm dev opens web and admin. Point Expo at Metro for iOS and Android sims.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink atlas-grain">
      <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-3">
            <BrandMark
              size="sm"
              className="transition-transform duration-200 group-hover:-rotate-3"
            />
            <span className="font-display text-lg font-semibold tracking-tight">LaunchStack</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#platform" className="transition-colors hover:text-ink">
              Platform
            </a>
            <a href="#surfaces" className="transition-colors hover:text-ink">
              Surfaces
            </a>
            <a href="#path" className="transition-colors hover:text-ink">
              Path
            </a>
            <a href="#pricing" className="transition-colors hover:text-ink">
              Pricing
            </a>
            <a href="#faq" className="transition-colors hover:text-ink">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm" className="hidden sm:inline-flex">
                Start building
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — one composition */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="absolute inset-y-0 right-0 hidden w-[50%] atlas-ink-panel md:block"
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1fr_1.08fr] md:py-24 lg:py-28">
          <div className="animate-[rise_500ms_ease-out]">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
              LaunchStack
            </p>
            <div className="atlas-rule mt-5 mb-7 w-16 bg-accent" style={{ height: 3 }} />
            <h1 className="font-display text-4xl font-semibold leading-[1.04] tracking-tight text-ink text-balance sm:text-5xl md:text-[3.65rem]">
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

          <aside className="relative flex justify-center md:min-h-[440px] md:justify-end md:pl-6">
            <div className="relative flex w-full max-w-[440px] items-end justify-center gap-3 sm:gap-5 md:max-w-none md:justify-end">
              <figure className="atlas-float relative z-10 w-[46%] max-w-[210px] animate-[rise_600ms_ease-out] md:w-[48%] md:max-w-[230px]">
                <div className="overflow-hidden rounded-[1.4rem] border-[3px] border-ink bg-ink shadow-[0_28px_56px_-22px_rgba(0,0,0,0.55)] ring-1 ring-white/10 md:border-paper/25">
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

              <figure className="atlas-float-delayed relative z-0 mb-6 w-[46%] max-w-[210px] animate-[rise_700ms_ease-out] md:mb-12 md:w-[48%] md:max-w-[230px]">
                <div className="overflow-hidden rounded-[1.15rem] border-[3px] border-ink bg-ink shadow-[0_28px_56px_-22px_rgba(0,0,0,0.55)] ring-1 ring-white/10 md:border-paper/25">
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

      {/* Platform seams */}
      <section id="platform" className="border-b border-line py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Platform
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl text-balance">
              Architecture that survives first customers
            </h2>
            <p className="mt-4 max-w-xl text-muted leading-relaxed">
              Not a feature grid of promises — the seams teams actually hit when shipping
              multi-tenant software.
            </p>
          </div>

          <div className="mt-14 grid gap-px bg-line md:grid-cols-2">
            {seams.map((item, i) => (
              <article
                key={item.title}
                className="bg-paper p-8 md:p-10 transition-colors hover:bg-surface"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="mb-5 h-[3px] w-10 bg-accent" aria-hidden />
                <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Surfaces — one job: show the three apps */}
      <section id="surfaces" className="border-b border-line bg-ink text-paper py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Surfaces
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
              Three apps. One package graph.
            </h2>
            <p className="mt-4 text-white/60 leading-relaxed">
              Customer web, internal admin, and native mobile — each a frontier, none a silo.
            </p>
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {surfaces.map((surface, i) => (
              <div
                key={surface.name}
                className="border-t border-white/15 pt-6 animate-[rise_500ms_ease-out]"
                style={{ animationDelay: `${80 + i * 80}ms` }}
              >
                <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  {surface.stack}
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">
                  {surface.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{surface.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Path — clone to ship */}
      <section id="path" className="border-b border-line py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Path
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl text-balance">
              From empty repo to running product
            </h2>
            <p className="mt-4 text-muted leading-relaxed">
              A short path with real infrastructure — not a tutorial that dies at hello world.
            </p>
          </div>

          <ol className="mt-14 space-y-0 border-y border-line">
            {steps.map((step) => (
              <li
                key={step.n}
                className="grid gap-4 border-b border-line py-8 last:border-b-0 md:grid-cols-[5rem_1fr] md:items-start md:gap-10"
              >
                <span className="font-display text-sm font-semibold tracking-[0.16em] text-accent">
                  {step.n}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Included — editorial inventory, not icon grid */}
      <section className="border-b border-line py-20 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Included
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl text-balance">
              Production gaps, closed
            </h2>
            <p className="mt-4 text-muted leading-relaxed">
              The boring, expensive parts teams rebuild every time — already wired.
            </p>
            <Link href="/signup" className="mt-8 inline-block">
              <Button className="gap-2">
                Start with the template <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <ul className="divide-y divide-line border-y border-line">
            {[
              ['CI & quality gates', 'GitHub Actions for lint, typecheck, and E2E'],
              ['Docker standalone', 'Multi-stage images for web and admin'],
              ['Edge rate limits', 'Upstash Redis via @template/kv'],
              ['Observability', 'Sentry on Edge, server, and client'],
              ['Email triggers', 'Brevo templates behind server routes'],
              ['Enum SSOT', 'Roles and statuses once in @template/types'],
            ].map(([title, body]) => (
              <li
                key={title}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <span className="font-display text-base font-semibold tracking-tight text-ink">
                  {title}
                </span>
                <span className="text-sm text-muted sm:text-right">{body}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b border-line py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Pricing
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Start free. Upgrade when the workspace grows.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-[1fr_1.12fr]">
            <div className="rounded-md border border-line bg-surface p-8 md:p-10">
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

            <div className="rounded-md border border-ink bg-ink p-8 text-paper md:p-10">
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
              <Link href="/signup" className="mt-8 block">
                <Button className="w-full bg-accent hover:bg-accent-hover">Start trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-line py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">Questions</h2>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {faqs.map((faq, idx) => (
              <button
                key={faq.q}
                type="button"
                className="flex w-full flex-col py-5 text-left transition-colors hover:bg-surface/60"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                aria-expanded={openFaq === idx}
              >
                <span className="flex items-center justify-between gap-4">
                  <span className="font-display text-lg font-semibold tracking-tight">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`}
                  />
                </span>
                {openFaq === idx && (
                  <span className="mt-3 max-w-2xl pr-8 text-sm leading-relaxed text-muted animate-[fade-in_300ms_ease-out]">
                    {faq.a}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-b border-line py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-md bg-ink px-8 py-14 text-paper md:px-14 md:py-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                backgroundImage:
                  'linear-gradient(125deg, transparent 40%, rgba(15,110,86,0.35) 40%, rgba(15,110,86,0.35) 42%, transparent 42%)',
              }}
              aria-hidden
            />
            <div className="relative max-w-xl">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                LaunchStack
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
                Stop rebuilding the foundation.
              </h2>
              <p className="mt-4 text-white/60 leading-relaxed">
                Clone once. Share auth, billing, and RLS across web, admin, and mobile — then write
                the product.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup">
                  <Button size="lg" className="gap-2 bg-accent hover:bg-accent-hover">
                    Open the template <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/25 bg-transparent text-paper hover:border-white/50 hover:bg-white/5"
                  >
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto bg-surface py-12 text-sm text-muted">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <BrandMark size="sm" />
              <span className="font-display font-semibold text-ink">LaunchStack</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              Enterprise monorepo template for B2B SaaS and cross-platform apps.
            </p>
          </div>
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-ink">
              Product
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <a href="#platform" className="hover:text-ink">
                Platform
              </a>
              <a href="#surfaces" className="hover:text-ink">
                Surfaces
              </a>
              <a href="#pricing" className="hover:text-ink">
                Pricing
              </a>
              <a href="#faq" className="hover:text-ink">
                FAQ
              </a>
            </div>
          </div>
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-ink">
              Legal
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/privacy" className="hover:text-ink">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-ink">
                Terms
              </Link>
            </div>
            <p className="mt-8">© 2026 LaunchStack</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
