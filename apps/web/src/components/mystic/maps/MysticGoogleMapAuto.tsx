'use client';

import { APILoadingStatus, useApiLoadingStatus } from '@vis.gl/react-google-maps';
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
        className={`${props.heightClassName ?? 'h-56'} w-full animate-pulse rounded-2xl bg-paper`}
      />
    );
  }
  return <MysticGoogleMapInner {...props} />;
}
