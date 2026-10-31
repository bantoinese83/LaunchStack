import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getVerifiedServerUser } from '@/lib/supabase/server';
import { userCanAccessMysticStudio } from '@/lib/mystic/studio-access';

const links = [
  { href: '/studio', label: 'Today' },
  { href: '/studio/calendar', label: 'Calendar' },
  { href: '/studio/clients', label: 'Clients' },
  { href: '/studio/messages', label: 'Messages' },
  { href: '/studio/blasts', label: 'Blasts' },
  { href: '/studio/referrals', label: 'Referrals' },
  { href: '/studio/analytics', label: 'Analytics' },
  { href: '/studio/settings', label: 'Settings' },
  { href: '/studio/instagram', label: 'Instagram' },
] as const;

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
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="type-eyebrow text-accent">Mystic studio</p>
            <h1 className="font-display text-xl font-medium">Luke&apos;s admin</h1>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-line px-3 py-1.5 hover:border-accent hover:bg-accent-soft"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
