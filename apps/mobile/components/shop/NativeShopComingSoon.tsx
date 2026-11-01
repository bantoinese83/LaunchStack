import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  MYSTIC_SHOP_COMING_SOON,
  MYSTIC_SHOP_PRODUCTS,
  formatShopFulfillmentLabel,
  formatUsd,
} from '@template/mystic';
import {
  MYSTIC_HAND_FONT,
  NativeButton,
  displayTitle,
  monoLabel,
  theme,
} from '@template/mobile-ui';
import { NativeScreenHeader } from '../mystic/NativeScreenHeader';

export function NativeShopComingSoon() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <NativeScreenHeader kicker="Shop" title={MYSTIC_SHOP_COMING_SOON.title} />
      <Text style={styles.lede}>{MYSTIC_SHOP_COMING_SOON.description}</Text>

      <View style={styles.pill}>
        <Text style={styles.pillText}>Checkout opens soon</Text>
      </View>

      {MYSTIC_SHOP_PRODUCTS.map((product, index) => (
        <View key={product.id} style={[styles.row, index === 0 && styles.rowFirst]}>
          <View style={styles.rowTop}>
            <Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text>
            <View style={styles.rowMain}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.category}>{product.category}</Text>
              <Text style={styles.productBody}>{product.description}</Text>
              <Text style={styles.fulfillment}>{formatShopFulfillmentLabel(product.launchAt)}</Text>
            </View>
            <View style={styles.priceCol}>
              <Text style={styles.price}>{formatUsd(product.priceCents)}</Text>
              <Text style={styles.soonBadge}>Soon</Text>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.ctaCard}>
        <Text style={styles.ctaEyebrow}>Until checkout opens</Text>
        <Text style={styles.ctaTitle}>Get a routine on your next visit</Text>
        <Text style={styles.ctaBody}>
          Book a house call and Luke can recommend volume, heat protection, or finish for your setup
          at home.
        </Text>
        <NativeButton title="Book a house call" onPress={() => router.push('/(app)/(tabs)/book')} />
        <NativeButton
          title="Message Luke"
          variant="secondary"
          onPress={() => router.push('/(app)/(tabs)/messages')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  content: { padding: 20, paddingBottom: 40 },
  lede: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: theme.muted,
  },
  pill: {
    alignSelf: 'flex-start',
    marginTop: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
    backgroundColor: theme.surface,
  },
  pillText: { ...monoLabel, fontSize: 11, color: theme.muted },
  row: {
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
  },
  rowFirst: {
    marginTop: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.line,
  },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  index: {
    fontFamily: MYSTIC_HAND_FONT,
    fontSize: 28,
    color: theme.line,
    minWidth: 36,
  },
  rowMain: { flex: 1, minWidth: 0 },
  productName: { ...displayTitle, fontSize: 20, color: theme.ink },
  category: { ...monoLabel, marginTop: 4, fontSize: 10, color: theme.accent },
  productBody: { marginTop: 8, fontSize: 14, lineHeight: 20, color: theme.muted },
  fulfillment: { ...monoLabel, marginTop: 10, fontSize: 10, color: theme.chalk },
  priceCol: { alignItems: 'flex-end', gap: 6 },
  price: { fontSize: 22, fontWeight: '600', color: theme.ink },
  soonBadge: {
    ...monoLabel,
    fontSize: 10,
    color: theme.muted,
    backgroundColor: theme.chalkSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radii.pill,
    overflow: 'hidden',
  },
  ctaCard: {
    marginTop: 28,
    padding: 20,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.plum,
    gap: 10,
  },
  ctaEyebrow: { ...monoLabel, fontSize: 10, color: theme.paper, opacity: 0.85 },
  ctaTitle: { fontSize: 22, fontWeight: '600', color: theme.paper, letterSpacing: -0.3 },
  ctaBody: { fontSize: 14, lineHeight: 20, color: theme.paper, opacity: 0.88, marginBottom: 6 },
});
