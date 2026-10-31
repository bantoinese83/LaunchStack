import type { Route } from 'next';
import type { ReactNode } from 'react';
import { MysticMagneticLink } from './MysticMagneticButton';

type Action = { href: Route; label: string; primary?: boolean };

type Props = {
  eyebrow?: string;
  title: string;
  description: ReactNode;
  actions: Action[];
  children?: ReactNode;
};

export function MysticSuccessPage({ eyebrow, title, description, actions, children }: Props) {
  return (
    <div className="mx-auto max-w-lg py-4 md:py-8">
      <div className="text-center">
        {eyebrow ? <p className="type-eyebrow text-success">{eyebrow}</p> : null}
        <h1 className="font-display mt-3 text-3xl font-medium tracking-tight text-ink md:text-4xl">
          {title}
        </h1>
        <div className="mt-4 text-muted">{description}</div>
      </div>
      {children}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {actions.map((action) => (
          <MysticMagneticLink
            key={action.href}
            href={action.href}
            variant={action.primary ? 'primary' : 'secondary'}
          >
            {action.label}
          </MysticMagneticLink>
        ))}
      </div>
    </div>
  );
}
