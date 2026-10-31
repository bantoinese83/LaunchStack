'use client';

import { APIProvider } from '@vis.gl/react-google-maps';
import type { ReactNode } from 'react';
import { getGoogleMapsBrowserKey } from '@/lib/mystic/google-maps-config';
import { shouldUseGoogleMapsClient } from '@/lib/mystic/mystic-maps-config';

export function MysticGoogleMapsProvider({ children }: { children: ReactNode }) {
  const apiKey = getGoogleMapsBrowserKey();
  if (!shouldUseGoogleMapsClient() || !apiKey) return children;
  return (
    <APIProvider apiKey={apiKey} libraries={['marker']} version="weekly">
      {children}
    </APIProvider>
  );
}
