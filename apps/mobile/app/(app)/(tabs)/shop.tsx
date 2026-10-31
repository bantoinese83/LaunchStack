import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { MYSTIC_SHOP_PRODUCTS, formatShopFulfillmentLabel, formatUsd } from '@template/mystic';
import { NativeButton, monoLabel, theme } from '@template/mobile-ui';
import { NativeScreenHeader } from '../../../components/mystic/NativeScreenHeader';
import { NativeScreenShell } from '../../../components/mystic/NativeScreenShell';
import { nativeScreenStyles } from '../../../components/mystic/nativeScreenStyles';

const appUrl = Constants.expoConfig?.extra?.appUrl ?? process.env.EXPO_PUBLIC_APP_URL ?? '';

export default function ShopTab() {
  return (
    <NativeScreenShell>
      <NativeScreenHeader
        kicker="Shop"
        title="At-home essentials"
        lede="Luke-curated pre-orders — checkout opens in your browser (same as web)."
      />
      {MYSTIC_SHOP_PRODUCTS.map((product) => (
        <View key={product.id} style={nativeScreenStyles.card}>
          <Text style={styles.category}>{product.category.toUpperCase()}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.desc}>{product.description}</Text>
          <Text style={styles.meta}>
            {formatUsd(product.priceCents)} · {formatShopFulfillmentLabel(product.launchAt)}
          </Text>
        </View>
      ))}
      <NativeButton
        title="Open shop checkout"
        onPress={() => {
          if (appUrl) void Linking.openURL(`${appUrl}/shop`);
        }}
      />
    </NativeScreenShell>
  );
}

const styles = StyleSheet.create({
  category: { ...monoLabel, fontSize: 9, color: theme.accent, marginBottom: 4 },
  name: { fontWeight: '600', color: theme.ink },
  desc: { marginTop: 4, fontSize: 13, color: theme.muted },
  meta: { marginTop: 8, fontSize: 12, color: theme.chalk },
});
