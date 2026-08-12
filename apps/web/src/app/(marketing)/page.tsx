'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Card, Badge } from '@template/ui';
import {
  Check,
  ShieldCheck,
  Smartphone,
  CreditCard,
  ArrowRight,
  Star,
  LayoutDashboard,
  MessageSquare,
  ChevronDown,
  Sparkles,
  Zap,
  Globe,
} from 'lucide-react';

export default function MarketingLandingPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'feedback' | 'mobile'>('dashboard');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Supabase Multi-Tenancy work in this template?',
      a: 'Every tenant table features a workspace_id foreign key. Data access is enforced directly inside PostgreSQL via Row Level Security (RLS) policies checking workspace membership.',
    },
    {
      q: 'Can I publish the mobile app to iOS App Store & Google Play Store?',
      a: 'Yes! The mobile directory is built with Expo Router and React Native. You can generate native binaries using Expo EAS (`eas build`) and deploy directly to both stores.',
    },
    {
      q: 'Is Stripe Billing pre-configured for webhooks & entitlements?',
      a: 'Absolutely. It includes server checkout session creators, customer portal redirect routes, and a verified Edge Webhook handler that syncs subscription status in real-time.',
    },
    {
      q: 'What transactional emails are supported with Brevo?',
      a: 'Templates for Welcome Emails, Workspace Invitations, Password Resets, and Roadmap Status Notifications are pre-built in `@template/email`.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 font-bold text-white shadow-lg shadow-blue-500/20">
              LS
            </div>
            <span className="text-lg font-bold tracking-tight text-white">LaunchStack</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="transition-colors hover:text-white">
              Features
            </a>
            <a href="#demo" className="transition-colors hover:text-white">
              Live Demo
            </a>
            <a href="#pricing" className="transition-colors hover:text-white">
              Pricing
            </a>
            <a href="#faq" className="transition-colors hover:text-white">
              FAQ
            </a>
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm" className="gap-1.5">
                <Sparkles className="h-4 w-4" /> Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
        {/* GLOWING AMBIENT LIGHTS */}
        <div className="absolute top-1/4 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-blue-600/20 to-purple-600/20 blur-[120px]" />

        <div className="mx-auto max-w-5xl px-6 text-center">
          <Badge
            variant="purple"
            className="mb-6 py-1 px-3 text-xs tracking-wider uppercase gap-1.5 inline-flex items-center"
          >
            <Zap className="h-3.5 w-3.5 text-purple-400" /> Production-Grade Full-Stack Template
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-tight">
            Build B2B SaaS & Native Apps <br />
            <span className="gradient-text">10x Faster with Monorepo</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl leading-relaxed">
            Stop reinventing multi-tenancy, Supabase RLS policies, Stripe webhooks, and mobile state
            sync. LaunchStack provides the complete production engine.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Start Building Free <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#demo">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Interactive Preview
              </Button>
            </a>
          </div>

          {/* SOCIAL PROOF */}
          <div className="mt-12 flex items-center justify-center space-x-2 text-sm text-slate-400">
            <div className="flex -space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-500 border-2 border-slate-950 flex items-center justify-center font-bold text-xs text-white">
                A
              </div>
              <div className="h-8 w-8 rounded-full bg-purple-500 border-2 border-slate-950 flex items-center justify-center font-bold text-xs text-white">
                B
              </div>
              <div className="h-8 w-8 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center font-bold text-xs text-white">
                C
              </div>
            </div>
            <div className="flex items-center space-x-1 pl-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-medium text-slate-300">Loved by 500+ Full-Stack Engineers</span>
          </div>
        </div>

        {/* INTERACTIVE DEMO PREVIEW MOCKUP */}
        <div id="demo" className="mt-16 mx-auto max-w-6xl px-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-4 md:p-6 backdrop-blur-xl">
            {/* MOCKUP TABS */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
              <div className="flex space-x-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>

              <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Web Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activeTab === 'feedback'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Feedback Roadmap
                </button>
                <button
                  onClick={() => setActiveTab('mobile')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activeTab === 'mobile'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mobile App
                </button>
              </div>
            </div>

            {/* TAB PREVIEW SCREENSHOT MOCKUPS */}
            {activeTab === 'dashboard' && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white">Acme Corp Dashboard</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Workspace ID: 11111111-1111-1111-1111-111111111111
                    </p>
                  </div>
                  <Badge variant="success">Stripe Pro Active</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Active Seats</p>
                    <p className="text-2xl font-extrabold text-white mt-1">4 / 20</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400 uppercase font-semibold">
                      Roadmap Upvotes
                    </p>
                    <p className="text-2xl font-extrabold text-white mt-1">128</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400 uppercase font-semibold">RLS Status</p>
                    <p className="text-2xl font-extrabold text-emerald-400 mt-1">Enforced</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Customer Feedback Board</h3>
                  <Button variant="primary" size="sm">
                    + Submit Idea
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-white text-sm">
                        Dark Mode Support in Expo Mobile App
                      </h4>
                      <Badge variant="info">Planned</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Automatically toggle dark mode themes based on device system preference.
                    </p>
                  </div>
                  <div className="flex flex-col items-center bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
                    <span className="text-xs text-slate-400">👍</span>
                    <span className="text-xs font-bold text-white">24</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mobile' && (
              <div className="mx-auto max-w-sm rounded-3xl border-4 border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="font-bold text-white text-sm">LaunchStack Expo App</span>
                  <Badge variant="purple">iOS / Android</Badge>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 uppercase">Session Token</p>
                  <p className="text-xs font-mono text-blue-400 mt-1">Expo SecureStore Encrypted</p>
                </div>
                <Button variant="primary" className="w-full">
                  Submit Native Feedback
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-20 border-t border-slate-800/60 bg-slate-950/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="info" className="mb-4">
              Features Engine
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Production Architecture Out Of The Box
            </h2>
            <p className="mt-4 text-slate-400">
              No generic utilities or placeholder code. Every feature is fully implemented with
              type-safety and server-enforced business logic.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:border-blue-500/50 transition-colors">
              <ShieldCheck className="h-10 w-10 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Supabase Strict RLS</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Zero client-trust multi-tenancy. Automated PostgreSQL Row Level Security policies
                isolate workspace data directly at the query level.
              </p>
            </Card>

            <Card className="hover:border-purple-500/50 transition-colors">
              <Smartphone className="h-10 w-10 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Expo React Native</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Expo Router native mobile app for iOS & Android with secure session storage (`Expo
                SecureStore`) and deep linking architecture.
              </p>
            </Card>

            <Card className="hover:border-emerald-500/50 transition-colors">
              <CreditCard className="h-10 w-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Stripe Billing Engine</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Server-verified Stripe checkout, billing portal redirects, Edge Webhook signature
                processing, and plan entitlement guards.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 border-t border-slate-800/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <Badge variant="warning" className="mb-4">
              Transparent Pricing
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Choose Your Plan
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Scale seamlessly from single developer to enterprise organization.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* FREE PLAN */}
            <Card className="border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Developer Starter</h3>
                <p className="text-slate-400 text-sm mt-1">Ideal for evaluating LaunchStack.</p>
                <div className="mt-6 text-4xl font-extrabold text-white">
                  $0 <span className="text-base font-normal text-slate-400">/mo</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-400" /> Up to 3 Workspace Members
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-400" /> Web & Mobile Application Access
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-400" /> Public Feedback Board
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="mt-8">
                <Button variant="outline" className="w-full">
                  Get Started Free
                </Button>
              </Link>
            </Card>

            {/* PRO PLAN */}
            <Card className="border-blue-600 bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                Recommended
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Pro Team</h3>
                <p className="text-slate-400 text-sm mt-1">
                  For growing teams building commercial SaaS apps.
                </p>
                <div className="mt-6 text-4xl font-extrabold text-white">
                  $49 <span className="text-base font-normal text-slate-400">/mo</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-blue-400" /> Up to 20 Workspace Members
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-blue-400" /> Stripe Verified Subscription Sync
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-blue-400" /> Unlimited Feedback Items & Upvoting
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-blue-400" /> Brevo Transactional Email Triggers
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="mt-8">
                <Button variant="primary" className="w-full">
                  Start 14-Day Free Trial
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 border-t border-slate-800/60 bg-slate-950/60">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <Card
                key={idx}
                className="cursor-pointer p-6"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{faq.q}</h3>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                  />
                </div>
                {openFaq === idx && (
                  <p className="mt-4 text-slate-400 text-sm leading-relaxed border-t border-slate-800 pt-4">
                    {faq.a}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-12 text-sm text-slate-500">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              LS
            </div>
            <span className="font-semibold text-slate-300">LaunchStack Monorepo</span>
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-slate-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-300">
              Terms of Service
            </Link>
          </div>
          <p>© 2026 LaunchStack Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
