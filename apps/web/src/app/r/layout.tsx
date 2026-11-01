import type { ReactNode } from 'react';
import Link from 'next/link';

export default function ReferralPublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line/60 px-6 py-4">
        <Link href="/" className="font-display text-lg font-medium text-ink hover:text-plum">
          Mystic Hair Co.
        </Link>
      </header>
      {children}
    </div>
  );
}
