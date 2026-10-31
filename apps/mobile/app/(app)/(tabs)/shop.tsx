import React from 'react';
import { useRouter } from 'expo-router';
import { NativeButton } from '@template/mobile-ui';
import { NativeEmptyState } from '../../../components/mystic/NativeEmptyState';
import { NativeScreenShell } from '../../../components/mystic/NativeScreenShell';

export default function ShopTab() {
  const router = useRouter();

  return (
    <NativeScreenShell>
      <NativeEmptyState
        variant="shop"
        action={
          <>
            <NativeButton
              title="Book a house call"
              onPress={() => router.push('/(app)/(tabs)/book')}
            />
            <NativeButton
              title="Message Luke"
              variant="secondary"
              onPress={() => router.push('/(app)/(tabs)/messages')}
            />
          </>
        }
      />
    </NativeScreenShell>
  );
}
