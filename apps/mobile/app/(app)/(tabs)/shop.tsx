import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { MYSTIC_SHOP_PRODUCTS, daysUntilLaunch, formatUsd } from '@template/mystic';
import { NativeButton, displayTitle, monoLabel, theme } from '@template/mobile-ui';

const appUrl = Constants.expoConfig?.extra?.appUrl ?? process.env.EXPO_PUBLIC_APP_URL ?? '';

export default function ShopTab() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Shop</Text>
      <Text style={styles.heading}>Pre-orders</Text>
      <Text style={styles.lede}>Checkout opens in your browser (same as web shop).</Text>
      {MYSTIC_SHOP_PRODUCTS.map((product) => (
        <View key={product.id} style={styles.card}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.desc}>{product.description}</Text>
          <Text style={styles.meta}>
            {formatUsd(product.priceCents)} · ~{daysUntilLaunch(product.launchAt)} days
          </Text>
        </View>
      ))}
      <NativeButton
        title="Open shop checkout"
        onPress={() => {
          if (appUrl) void Linking.openURL(`${appUrl}/shop`);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20, paddingBottom: 40 },
  kicker: { ...monoLabel, color: theme.gold },
  heading: { ...displayTitle, color: theme.ink },
  lede: { color: theme.muted, marginVertical: 12 },
  card: {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: theme.radii.lg,
    padding: 14,
    marginBottom: 10,
    backgroundColor: theme.surface,
  },
  name: { fontWeight: '600', color: theme.ink },
  desc: { marginTop: 4, fontSize: 13, color: theme.muted },
  meta: { marginTop: 8, fontSize: 12, color: theme.chalk },
});
