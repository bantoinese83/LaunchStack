import React from 'react';
import { useRouter } from 'expo-router';
import { MYSTIC_SHOP_COMING_SOON } from '@template/mystic';
import { NativeButton } from '@template/mobile-ui';
import { NativeEmptyState } from '../../../components/mystic/NativeEmptyState';
import { NativeScreenHeader } from '../../../components/mystic/NativeScreenHeader';
import { NativeScreenShell } from '../../../components/mystic/NativeScreenShell';

export default function ShopTab() {
  const router = useRouter();

  return (
    <NativeScreenShell>
      <NativeScreenHeader
        kicker="Shop"
        title="At-home essentials"
        lede="Pro styling products for house-call clients."
      />
      <NativeEmptyState
        variant="shop"
        title={MYSTIC_SHOP_COMING_SOON.title}
        description={MYSTIC_SHOP_COMING_SOON.compactDescription}
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
