'use client';

import { usePathname } from 'next/navigation';
import { resolveStudioBreadcrumbs } from '@/lib/mystic/breadcrumbs';
import { MysticBreadcrumbNav } from '@/components/mystic/MysticBreadcrumbNav';

export function MysticStudioBreadcrumbs() {
  const pathname = usePathname();
  const items = resolveStudioBreadcrumbs(pathname);
  if (!items?.length) return null;

  return <MysticBreadcrumbNav items={items} className="mb-6 md:mb-8" />;
}
