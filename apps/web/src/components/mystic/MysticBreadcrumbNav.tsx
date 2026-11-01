import Link from 'next/link';
import type { Route } from 'next';
import { ChevronRight } from 'lucide-react';
import type { MysticBreadcrumbItem } from '@/lib/mystic/breadcrumbs';

type Props = {
  items: MysticBreadcrumbItem[];
  className?: string;
};

export function MysticBreadcrumbNav({ items, className = '' }: Props) {
  if (items.length === 0) return null;

  const lastIndex = items.length - 1;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs leading-snug text-muted">
        {items.map((item, index) => {
          const isLast = index === lastIndex;
          return (
            <li key={`${item.href}-${item.label}`} className="inline-flex items-center gap-1">
              {index > 0 ? (
                <ChevronRight className="h-3 w-3 shrink-0 text-line/90" aria-hidden />
              ) : null}
              {isLast ? (
                <span className="font-medium text-ink/85" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href as Route}
                  className="mystic-link-focus rounded-sm underline-offset-2 transition hover:text-ink hover:underline"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
