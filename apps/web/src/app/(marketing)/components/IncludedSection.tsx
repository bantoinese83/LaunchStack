import React from 'react';
import Link from 'next/link';
import { Button } from '@template/ui';
import { ArrowRight } from 'lucide-react';

export const IncludedSection = () => (
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
);
