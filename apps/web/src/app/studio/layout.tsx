import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getVerifiedServerUser } from '@/lib/supabase/server';
import { userCanAccessMysticStudio } from '@/lib/mystic/studio-access';
import { StudioNav } from './components/StudioNav';

export default async function StudioLayout({ children }: { children: ReactNode }) {
  const { userId } = await getVerifiedServerUser();
  if (!userId) {
    redirect('/login?next=/studio');
  }
  const allowed = await userCanAccessMysticStudio(userId);
  if (!allowed) {
    redirect('/?studio=forbidden');
  }

  return (
    <div className="min-h-screen mystic-studio-shell atlas-grain text-ink">
      <header className="sticky top-0 z-40 border-b border-line/50 bg-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-start justify-between gap-4 md:block">
            <div>
              <p className="type-eyebrow text-accent">Mystic studio</p>
              <h1 className="font-display text-xl font-medium tracking-tight">Luke&apos;s admin</h1>
            </div>
            <Link
              href="/"
              className="rounded-full border border-line/80 px-3 py-1.5 text-xs text-muted transition hover:border-accent/35 md:hidden"
            >
              Site
            </Link>
          </div>
          <StudioNav />
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">{children}</div>
    </div>
  );
}
