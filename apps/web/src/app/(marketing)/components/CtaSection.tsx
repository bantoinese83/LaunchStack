import React from 'react';
import Link from 'next/link';
import { Button } from '@template/ui';
import { ArrowRight } from 'lucide-react';

export const CtaSection = () => (
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
            Clone once. Share auth, billing, and RLS across web, admin, and mobile — then write the
            product.
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
);
