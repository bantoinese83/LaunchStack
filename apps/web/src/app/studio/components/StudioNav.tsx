'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import type { MysticIconRole } from '@template/mystic';
import { MysticIcon } from '@/components/mystic/icons/MysticIcon';
import { mysticStudioNavLink } from '@/components/mystic/mystic-styles';

const links: {
  href: string;
  label: string;
  exact?: boolean;
  icon: MysticIconRole;
}[] = [
  { href: '/studio', label: 'Today', exact: true, icon: 'studioToday' },
  { href: '/studio/calendar', label: 'Calendar', icon: 'studioCalendar' },
  { href: '/studio/clients', label: 'Clients', icon: 'studioClients' },
  { href: '/studio/book', label: 'Book', icon: 'studioCalendar' },
  { href: '/studio/billing', label: 'Billing', icon: 'studioSettings' },
  { href: '/studio/messages', label: 'Messages', icon: 'studioMessages' },
  { href: '/studio/blasts', label: 'Blasts', icon: 'studioBlasts' },
  { href: '/studio/promotions', label: 'Promos', icon: 'studioReferrals' },
  { href: '/studio/referrals', label: 'Referrals', icon: 'studioReferrals' },
  { href: '/studio/analytics', label: 'Analytics', icon: 'studioAnalytics' },
  { href: '/studio/settings', label: 'Settings', icon: 'studioSettings' },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudioNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 text-sm">
      {links.map((link) => {
        const active = isActive(pathname, link.href, link.exact);
        return (
          <Link
            key={link.href}
            href={link.href as Route}
            className={`${mysticStudioNavLink(active)} inline-flex items-center gap-1.5`}
          >
            <MysticIcon
              name={link.icon}
              className={`h-3.5 w-3.5 ${active ? 'text-gold' : 'opacity-70'}`}
              strokeWidth={2}
            />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
