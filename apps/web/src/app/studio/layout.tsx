import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getVerifiedServerUser } from '@/lib/supabase/server';
import { userCanAccessMysticStudio } from '@/lib/mystic/studio-access';
import { MysticStudioBreadcrumbs } from '@/components/mystic/MysticStudioBreadcrumbs';
import { StudioNav } from './components/StudioNav';
import { StudioGoogleMapsProvider } from './components/StudioGoogleMapsProvider';

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
    <div className="min-h-screen mystic-studio-shell text-ink">
      <header className="mystic-glass sticky top-0 z-40 border-b border-line/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-5 sm:py-5 md:flex-row md:items-center md:justify-between md:gap-4 md:px-8">
          <div className="flex items-start justify-between gap-4 md:block">
            <div className="min-w-0">
              <p className="type-eyebrow text-accent">Mystic studio</p>
              <p className="font-display mystic-gradient-ink text-lg font-medium tracking-tight md:text-xl">
                Luke&apos;s admin
              </p>
            </div>
            <Link
              href="/"
              className="mystic-interactive rounded-full border border-line/80 px-3 py-1.5 text-xs text-muted hover:border-accent/35 md:hidden"
            >
              Site
            </Link>
          </div>
          <StudioNav />
        </div>
      </header>
      <StudioGoogleMapsProvider>
        <div className="mx-auto w-full max-w-6xl px-4 py-8 pb-16 sm:px-5 md:px-8 md:py-10 md:pb-20">
          <MysticStudioBreadcrumbs />
          {children}
        </div>
      </StudioGoogleMapsProvider>
    </div>
  );
}
