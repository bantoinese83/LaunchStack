import React from 'react';
import Link from 'next/link';
import { Button, BrandMark } from '@template/ui';

export const MarketingHeader = () => (
  <header className="sticky top-0 z-50 border-b border-line/80 bg-paper/85 backdrop-blur-md">
    <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-6">
      <Link href="/" className="group flex items-center gap-3">
        <BrandMark
          size="sm"
          tone="shell"
          animated
          className="transition-transform duration-300 group-hover:-rotate-6"
        />
        <span className="font-display text-xl font-medium tracking-tight">LaunchStack</span>
      </Link>

      <nav className="hidden items-center gap-7 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted md:flex">
        <a href="#platform" className="transition-colors hover:text-accent">
          Architecture
        </a>
        <a href="#stack" className="transition-colors hover:text-accent">
          Stack
        </a>
        <a href="#surfaces" className="transition-colors hover:text-accent">
          Surfaces
        </a>
        <a href="#path" className="transition-colors hover:text-accent">
          Path
        </a>
        <a href="#pricing" className="transition-colors hover:text-accent">
          Pricing
        </a>
        <a href="#faq" className="transition-colors hover:text-accent">
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
);
