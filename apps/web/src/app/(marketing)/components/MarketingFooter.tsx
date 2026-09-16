import React from 'react';
import Link from 'next/link';
import { BrandMark } from '@template/ui';

export const MarketingFooter = () => (
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
        <p className="mt-8">© {new Date().getFullYear()} LaunchStack</p>
      </div>
    </div>
  </footer>
);
