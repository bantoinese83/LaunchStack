import type { ReactNode } from 'react';
import { MysticAppShell } from '@/components/mystic/MysticAppShell';
import { MysticGoogleMapsProvider } from '@/components/mystic/maps/MysticGoogleMapsProvider';
import { MysticOnboardingGate } from '@/components/mystic/MysticOnboardingGate';

export default function ClientAppLayout({ children }: { children: ReactNode }) {
  return (
    <MysticGoogleMapsProvider>
      <MysticAppShell>
        <MysticOnboardingGate>{children}</MysticOnboardingGate>
      </MysticAppShell>
    </MysticGoogleMapsProvider>
  );
}
