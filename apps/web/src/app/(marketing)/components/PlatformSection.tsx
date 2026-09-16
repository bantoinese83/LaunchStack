import React from 'react';

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

export const PlatformSection = () => (
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
          Not a feature grid of promises — the seams teams actually hit when shipping multi-tenant
          software.
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
);
