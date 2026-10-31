import type { ReactNode } from 'react';
import { MysticAppShell } from '@/components/mystic/MysticAppShell';
import { MysticGoogleMapsProvider } from '@/components/mystic/maps/MysticGoogleMapsProvider';

export default function ClientAppLayout({ children }: { children: ReactNode }) {
  return (
    <MysticGoogleMapsProvider>
      <MysticAppShell>{children}</MysticAppShell>
    </MysticGoogleMapsProvider>
  );
}
