import type { ReactNode } from 'react';
import { MysticBreadcrumbs } from './MysticBreadcrumbs';
import { MysticHeader } from './MysticHeader';

type Props = {
  children: ReactNode;
  /** Extra classes on `<main>` */
  mainClassName?: string;
};

export function MysticAppShell({ children, mainClassName = '' }: Props) {
  return (
    <div className="min-h-screen mystic-app-shell atlas-grain text-ink">
      <MysticHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className={`mx-auto w-full max-w-6xl px-4 py-6 pb-12 outline-none sm:px-5 md:px-8 md:py-8 md:pb-14 ${mainClassName}`}
      >
        <MysticBreadcrumbs />
        {children}
      </main>
    </div>
  );
}
