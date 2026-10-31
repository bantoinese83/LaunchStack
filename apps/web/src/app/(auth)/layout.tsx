import type { ReactNode } from 'react';
import { MysticAuthBackgroundVideo } from '@/components/mystic/MysticAuthBackgroundVideo';
import { MysticAuthMediaCredit } from '@/components/mystic/MysticAuthMediaCredit';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6">
      <MysticAuthBackgroundVideo />
      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 w-full max-w-md outline-none animate-[rise_400ms_ease-out]"
      >
        {children}
      </main>
      <MysticAuthMediaCredit />
    </div>
  );
}
