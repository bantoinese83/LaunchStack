import React from 'react';

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

export const SurfacesSection = () => (
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
);
