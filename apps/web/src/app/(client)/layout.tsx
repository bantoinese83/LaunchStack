import type { ReactNode } from 'react';
import { MysticAppShell } from '@/components/mystic/MysticAppShell';

export default function ClientAppLayout({ children }: { children: ReactNode }) {
  return <MysticAppShell>{children}</MysticAppShell>;
}
