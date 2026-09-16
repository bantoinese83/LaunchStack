import React from 'react';
import Link from 'next/link';
import { Button, BrandMark } from '@template/ui';

export const MarketingHeader = () => (
  <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-sm">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <Link href="/" className="group flex items-center gap-3">
        <BrandMark size="sm" className="transition-transform duration-200 group-hover:-rotate-3" />
        <span className="font-display text-lg font-semibold tracking-tight">LaunchStack</span>
      </Link>

      <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
        <a href="#platform" className="transition-colors hover:text-ink">
          Platform
        </a>
        <a href="#surfaces" className="transition-colors hover:text-ink">
          Surfaces
        </a>
        <a href="#path" className="transition-colors hover:text-ink">
          Path
        </a>
        <a href="#pricing" className="transition-colors hover:text-ink">
          Pricing
        </a>
        <a href="#faq" className="transition-colors hover:text-ink">
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
