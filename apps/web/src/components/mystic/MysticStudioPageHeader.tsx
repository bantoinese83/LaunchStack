import type { ReactNode } from 'react';
import { mysticPageEnter } from '@/components/mystic/mystic-styles';

type Props = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
};

export function MysticStudioPageHeader({
  title,
  description,
  eyebrow,
  actions,
  className = '',
}: Props) {
  return (
    <header
      className={`flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4 ${mysticPageEnter} ${className}`}
    >
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <p className="type-eyebrow text-accent">{eyebrow}</p> : null}
        <h1 className="font-display mystic-gradient-ink mt-1.5 text-2xl font-medium tracking-tight md:text-3xl lg:text-[2.125rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pb-0.5">{actions}</div>
      ) : null}
    </header>
  );
}
