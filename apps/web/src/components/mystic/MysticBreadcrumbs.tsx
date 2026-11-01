'use client';

import { usePathname } from 'next/navigation';
import { resolveMysticBreadcrumbs } from '@/lib/mystic/breadcrumbs';
import { MysticBreadcrumbNav } from '@/components/mystic/MysticBreadcrumbNav';

type Props = {
  className?: string;
};

export function MysticBreadcrumbs({ className = '' }: Props) {
  const pathname = usePathname();
  const items = resolveMysticBreadcrumbs(pathname);
  if (!items?.length) return null;

  return <MysticBreadcrumbNav items={items} className={`mb-4 md:mb-5 ${className}`.trim()} />;
}
