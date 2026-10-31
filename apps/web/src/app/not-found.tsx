'use client';

import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';

export default function NotFound() {
  return (
    <div className="mystic-app-shell flex min-h-screen flex-col atlas-grain">
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-20 text-center">
        <p className="type-eyebrow text-accent">404</p>
        <h1 className="font-display mt-3 text-3xl font-medium tracking-tight text-ink">
          This page wandered off
        </h1>
        <p className="mt-4 max-w-md text-muted">
          The link may be old or mistyped. Head home or book your next house call.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <MysticMagneticLink href="/">Home</MysticMagneticLink>
          <MysticMagneticLink href="/book" variant="secondary">
            Book now
          </MysticMagneticLink>
        </div>
      </div>
    </div>
  );
}
