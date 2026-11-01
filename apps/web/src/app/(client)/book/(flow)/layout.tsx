import type { ReactNode } from 'react';
import { mysticPageEnter, mysticPageStack } from '@/components/mystic/mystic-styles';

export default function BookLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`mx-auto w-full max-w-xl lg:max-w-none mystic-book-shell ${mysticPageStack} ${mysticPageEnter} px-0 py-2 sm:py-4 md:py-6`}
    >
      {children}
    </div>
  );
}
