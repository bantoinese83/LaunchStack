'use client';

import type { ReactNode } from 'react';
import { LukeProfileProvider } from '@/components/mystic/LukeProfileContext';

export function MarketingShell({ children }: { children: ReactNode }) {
  return <LukeProfileProvider>{children}</LukeProfileProvider>;
}
