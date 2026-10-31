import type { ReactNode } from 'react';
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
        className={`mx-auto w-full max-w-6xl px-5 py-8 outline-none md:px-8 md:py-10 ${mainClassName}`}
      >
        {children}
      </main>
    </div>
  );
}
