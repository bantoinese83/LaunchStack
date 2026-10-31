'use client';

import type { ReactNode } from 'react';
import { MysticGoogleMapsProvider } from '@/components/mystic/maps/MysticGoogleMapsProvider';

export function StudioGoogleMapsProvider({ children }: { children: ReactNode }) {
  return <MysticGoogleMapsProvider>{children}</MysticGoogleMapsProvider>;
}
