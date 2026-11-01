'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { needsClientOnboarding } from '@template/mystic';
import { fetchOnboardingCompletedAt } from '@/lib/mystic/client-onboarding-api';
import { MysticSalonLoader } from '@/components/mystic/MysticSalonLoader';

type Props = { children: ReactNode };

function MysticOnboardingGateInner({ children }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    void fetchOnboardingCompletedAt()
      .then((completedAt) => {
        if (!active) return;
        if (completedAt === undefined) {
          setReady(true);
          return;
        }
        if (needsClientOnboarding(completedAt)) {
          router.replace('/welcome');
          return;
        }
        setReady(true);
      })
      .catch(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (!ready) {
    return <MysticSalonLoader copyKey="default" fill />;
  }

  return children;
}

export function MysticOnboardingGate({ children }: Props) {
  const pathname = usePathname();
  if (pathname === '/welcome') {
    return children;
  }
  return <MysticOnboardingGateInner key={pathname}>{children}</MysticOnboardingGateInner>;
}
