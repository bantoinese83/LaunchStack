import type { ReactNode } from 'react';

export default function BookLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-xl mystic-book-shell rounded-[1.75rem] border border-line/50 bg-surface/50 p-5 md:p-8">
      {children}
    </div>
  );
}
