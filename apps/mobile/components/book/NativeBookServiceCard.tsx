import React, { useState } from 'react';
import {
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { formatUsd, type MysticService } from '@template/mystic';
import { MYSTIC_HAND_FONT, monoLabel, NativeButton, theme } from '@template/mobile-ui';
import { NATIVE_SERVICE_CARD_IMAGE } from '../../lib/service-card-images';

type Props = {
  service: MysticService;
  selected: boolean;
  onSelect: () => void;
  style?: ViewStyle;
};

/** Tap to select; Details sheet for the “back of the card” copy (no 3D flip on native). */
export function NativeBookServiceCard({ service, selected, onSelect, style }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const photo = NATIVE_SERVICE_CARD_IMAGE[service.id];

  return (
    <>
      <View style={[styles.tile, selected && styles.tileSelected, style]}>
        <ImageBackground
          source={photo}
          style={styles.photo}
          imageStyle={styles.photoImage}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View
            style={[styles.photoScrim, selected && styles.photoScrimSelected]}
            pointerEvents="none"
          />
          <Pressable
            onPress={onSelect}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${service.name}, ${service.durationMinutes} minutes, ${formatUsd(service.priceCents)}`}
            style={styles.tileBody}
          >
            <View style={styles.tileTop}>
              <View style={styles.tileTopSpacer} />
              <Text style={styles.duration}>{service.durationMinutes}m</Text>
            </View>
            {selected ? (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>Selected</Text>
              </View>
            ) : null}
            <Text style={styles.title}>{service.name}</Text>
            <Text style={styles.meta} numberOfLines={selected ? undefined : 2}>
              {selected
                ? service.description
                : `${service.durationMinutes} min · ${formatUsd(service.priceCents)}`}
            </Text>
            {selected ? (
              <Text style={styles.priceSelected}>{formatUsd(service.priceCents)}</Text>
            ) : null}
          </Pressable>
        </ImageBackground>
        <Pressable
          onPress={() => setDetailsOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Details for ${service.name}`}
          hitSlop={8}
          style={styles.detailsBtn}
        >
          <Text style={styles.detailsBtnText}>Details</Text>
        </Pressable>
      </View>

      <Modal
        visible={detailsOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailsOpen(false)}
      >
        <View style={styles.sheet}>
          <Text style={styles.sheetHand}>{service.name}</Text>
          <Text style={styles.sheetBody}>{service.description}</Text>
          <View style={styles.sheetGrid}>
            <View style={styles.sheetCell}>
              <Text style={styles.sheetLabel}>At your door</Text>
              <Text style={styles.sheetValue}>House call</Text>
            </View>
            <View style={styles.sheetCell}>
              <Text style={styles.sheetLabel}>Time</Text>
              <Text style={styles.sheetValue}>{service.durationMinutes} min</Text>
            </View>
            <View style={[styles.sheetCell, styles.sheetCellWide]}>
              <Text style={styles.sheetLabel}>Starting at</Text>
              <Text style={styles.sheetPrice}>{formatUsd(service.priceCents)}</Text>
            </View>
          </View>
          <NativeButton
            title={selected ? 'Selected for this visit' : `Select ${service.name}`}
            onPress={() => {
              onSelect();
              setDetailsOpen(false);
            }}
            style={styles.sheetCta}
          />
          <NativeButton title="Close" variant="secondary" onPress={() => setDetailsOpen(false)} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '47.5%',
    flexGrow: 1,
    minWidth: '45%',
    borderRadius: theme.radii.lg,
    backgroundColor: theme.surface,
    overflow: 'hidden',
  },
  tileSelected: {
    borderWidth: 1,
    borderColor: theme.gold,
  },
  photo: { flex: 1, minHeight: 168 },
  photoImage: { borderTopLeftRadius: theme.radii.lg, borderTopRightRadius: theme.radii.lg },
  photoScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(250,248,244,0.72)',
  },
  photoScrimSelected: {
    backgroundColor: 'rgba(248,243,230,0.82)',
  },
  tileBody: {
    flex: 1,
    padding: 14,
    paddingBottom: 8,
    gap: 6,
    justifyContent: 'flex-end',
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 10,
    left: 14,
    right: 14,
  },
  tileTopSpacer: { flex: 1 },
  duration: {
    ...monoLabel,
    fontSize: 10,
    color: theme.muted,
    backgroundColor: theme.paper,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radii.pill,
    overflow: 'hidden',
  },
  selectedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radii.pill,
    marginBottom: 4,
  },
  selectedBadgeText: {
    ...monoLabel,
    fontSize: 10,
    color: theme.accent,
    fontWeight: '600',
  },
  title: { fontSize: 16, fontWeight: '600', color: theme.ink },
  meta: { fontSize: 12, lineHeight: 17, color: theme.muted },
  priceSelected: { fontSize: 15, fontWeight: '600', color: theme.ink, marginTop: 4 },
  detailsBtn: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.line,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: theme.surface,
  },
  detailsBtnText: {
    ...monoLabel,
    fontSize: 11,
    color: theme.plum,
    fontWeight: '600',
  },
  sheet: {
    flex: 1,
    backgroundColor: theme.paper,
    padding: 24,
    paddingTop: 28,
  },
  sheetHand: {
    fontFamily: MYSTIC_HAND_FONT,
    fontSize: 28,
    color: theme.plum,
  },
  sheetBody: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: theme.ink,
  },
  sheetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.line,
  },
  sheetCell: { width: '45%', minWidth: 120 },
  sheetCellWide: { width: '100%' },
  sheetLabel: { ...monoLabel, fontSize: 10, color: theme.muted },
  sheetValue: { marginTop: 4, fontSize: 15, fontWeight: '600', color: theme.ink },
  sheetPrice: { marginTop: 4, fontSize: 28, fontWeight: '600', color: theme.ink },
  sheetCta: { marginTop: 'auto', marginBottom: 10 },
});
