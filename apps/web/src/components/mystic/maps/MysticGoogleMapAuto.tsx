'use client';

import { APILoadingStatus, useApiLoadingStatus } from '@vis.gl/react-google-maps';
import { MysticSalonLoader } from '@/components/mystic/MysticSalonLoader';
import { MysticGoogleMapInner } from './MysticGoogleMapInner';
import { MysticOsmMap } from './MysticOsmMap';
import type { MysticMapShellProps } from './mystic-map-types';

/** Expects `MysticGoogleMapsProvider` above when Maps JS is loaded. */
export function MysticGoogleMapWithOsmFallback(props: MysticMapShellProps) {
  const status = useApiLoadingStatus();
  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return <MysticOsmMap {...props} />;
  }
  if (status === APILoadingStatus.LOADING) {
    return (
      <div
        className={`${props.heightClassName ?? 'h-56'} flex w-full items-center justify-center rounded-2xl bg-paper`}
      >
        <MysticSalonLoader copyKey="map" size="sm" hideLabel />
      </div>
    );
  }
  return <MysticGoogleMapInner {...props} />;
}
