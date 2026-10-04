import React from 'react';
import Link from 'next/link';
import { BrandMark } from '@template/ui';

export const MarketingFooter = () => (
  <footer className="mt-auto border-t border-line bg-surface/80 py-12 text-sm text-muted">
    <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1.2fr_1fr_1fr]">
      <div>
        <div className="flex items-center gap-2">
          <BrandMark size="sm" />
          <span className="font-display text-lg font-medium text-ink">LaunchStack</span>
        </div>
        <p className="mt-3 max-w-xs text-sm leading-relaxed">
          Enterprise monorepo template for B2B SaaS and cross-platform apps — studio-grade UX,
          production-grade seams.
        </p>
      </div>
      <div>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink">
          Product
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <a href="#platform" className="transition-colors hover:text-accent">
            Platform
          </a>
          <a href="#surfaces" className="transition-colors hover:text-accent">
            Surfaces
          </a>
          <a href="#pricing" className="transition-colors hover:text-accent">
            Pricing
          </a>
          <a href="#faq" className="transition-colors hover:text-accent">
            FAQ
          </a>
        </div>
      </div>
      <div>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink">
          Legal
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Link href="/privacy" className="transition-colors hover:text-accent">
            Privacy
          </Link>
          <Link href="/cookies" className="transition-colors hover:text-accent">
            Cookies
          </Link>
          <Link href="/terms" className="transition-colors hover:text-accent">
            Terms
          </Link>
        </div>
        <p className="mt-8 font-mono text-[10px] uppercase tracking-wide text-muted">
          © {new Date().getFullYear()} LaunchStack
        </p>
      </div>
    </div>
  </footer>
);
