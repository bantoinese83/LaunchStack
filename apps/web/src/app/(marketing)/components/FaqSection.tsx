'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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

export const FaqSection = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="faq" className="border-b border-line py-20 md:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <p className="type-eyebrow text-accent">FAQ</p>
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
  );
};
