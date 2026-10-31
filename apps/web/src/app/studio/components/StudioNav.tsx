'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { mysticStudioNavLink } from '@/components/mystic/mystic-styles';

const links: { href: string; label: string; exact?: boolean }[] = [
  { href: '/studio', label: 'Today', exact: true },
  { href: '/studio/calendar', label: 'Calendar' },
  { href: '/studio/clients', label: 'Clients' },
  { href: '/studio/messages', label: 'Messages' },
  { href: '/studio/blasts', label: 'Blasts' },
  { href: '/studio/referrals', label: 'Referrals' },
  { href: '/studio/analytics', label: 'Analytics' },
  { href: '/studio/settings', label: 'Settings' },
  { href: '/studio/instagram', label: 'Instagram' },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudioNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 text-sm">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href as Route}
          className={mysticStudioNavLink(isActive(pathname, link.href, link.exact))}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
