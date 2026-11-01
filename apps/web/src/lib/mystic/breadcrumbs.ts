import type { Route } from 'next';

export type MysticBreadcrumbItem = { href: Route; label: string };

const SEGMENT_LABELS: Record<string, string> = {
  book: 'Book',
  shop: 'Shop',
  memberships: 'Plans',
  visits: 'My visits',
  messages: 'Messages',
  account: 'Account',
  success: 'Confirmation',
  privacy: 'Privacy',
  cookies: 'Cookies',
  terms: 'Terms',
};

const CLIENT_ROOTS = new Set(['book', 'shop', 'memberships', 'visits', 'messages', 'account']);

const MARKETING_LEGAL_ROOTS = new Set(['privacy', 'cookies', 'terms']);

const STUDIO_SEGMENT_LABELS: Record<string, string> = {
  studio: 'Studio',
  calendar: 'Calendar',
  analytics: 'Analytics',
  clients: 'Clients',
  settings: 'Settings',
  referrals: 'Referrals',
  instagram: 'Instagram',
  blasts: 'Blasts',
  messages: 'Messages',
};

function labelForSegment(segment: string, map: Record<string, string>): string {
  return map[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

function crumbsFromSegments(
  segments: string[],
  labelMap: Record<string, string>
): MysticBreadcrumbItem[] {
  const crumbs: MysticBreadcrumbItem[] = [{ href: '/', label: 'Home' }];
  let acc = '';
  for (const segment of segments) {
    acc += `/${segment}`;
    crumbs.push({ href: acc as Route, label: labelForSegment(segment, labelMap) });
  }
  return crumbs;
}

/** Client app + marketing legal pages under `(client)` and `/privacy`, etc. */
export function resolveMysticBreadcrumbs(pathname: string): MysticBreadcrumbItem[] | null {
  const path = (pathname.split('?')[0] ?? '/').replace(/\/$/, '') || '/';
  if (path === '/') return null;

  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const root = segments[0];
  if (CLIENT_ROOTS.has(root)) {
    return crumbsFromSegments(segments, SEGMENT_LABELS);
  }
  if (MARKETING_LEGAL_ROOTS.has(root) && segments.length === 1) {
    return crumbsFromSegments(segments, SEGMENT_LABELS);
  }

  return null;
}

/** Luke studio admin (`/studio/*`). */
export function resolveStudioBreadcrumbs(pathname: string): MysticBreadcrumbItem[] | null {
  const path = (pathname.split('?')[0] ?? '/').replace(/\/$/, '') || '/';
  if (path === '/studio') {
    return [
      { href: '/', label: 'Home' },
      { href: '/studio', label: 'Studio' },
    ];
  }
  if (!path.startsWith('/studio/')) return null;

  const segments = path.split('/').filter(Boolean);
  return crumbsFromSegments(segments, STUDIO_SEGMENT_LABELS);
}
