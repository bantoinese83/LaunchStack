import React from 'react';

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

export const PathSection = () => (
  <section id="path" className="border-b border-line py-20 md:py-24">
    <div className="mx-auto max-w-6xl px-6">
      <div className="max-w-xl">
        <p className="type-eyebrow text-accent">Path</p>
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
);
