import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatUsd, type MysticService } from '@template/mystic';
import { MYSTIC_HAND_FONT, monoLabel, NativeButton, theme } from '@template/mobile-ui';
import { NATIVE_BOOK_CARD_LUKE_IMAGE } from '../../lib/book-card-images';
import { NATIVE_SERVICE_CARD_IMAGE } from '../../lib/service-card-images';

type Props = {
  service: MysticService;
  selected: boolean;
  onSelect: () => void;
  style?: ViewStyle;
  /** Fresha-style list row (default) or photo tile grid. */
  variant?: 'list' | 'tile';
};

/** Tap to select; Details sheet for the “back of the card” copy (no 3D flip on native). */
export function NativeBookServiceCard({
  service,
  selected,
  onSelect,
  style,
  variant = 'list',
}: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const photo = NATIVE_SERVICE_CARD_IMAGE[service.id];
  const lukePhoto = NATIVE_BOOK_CARD_LUKE_IMAGE[service.id];

  const detailsSheet = (
    <Modal
      visible={detailsOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setDetailsOpen(false)}
    >
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.sheetContent}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={lukePhoto}
          style={styles.sheetLukePhoto}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <Text style={styles.sheetLukeLabel}>Your stylist · Luke</Text>
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
      </ScrollView>
    </Modal>
  );

  if (variant === 'list') {
    return (
      <>
        <View
          style={[styles.listCard, selected && styles.listCardSelected, style]}
          accessibilityRole="none"
        >
          <View style={styles.listBody}>
            <Pressable
              onPress={onSelect}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${service.name}, ${service.durationMinutes} minutes, ${formatUsd(service.priceCents)}`}
              style={styles.listTextCol}
            >
              <Text style={styles.listTitle}>{service.name}</Text>
              <Text style={styles.listDuration}>{service.durationMinutes} min</Text>
              <Text style={styles.listDescription} numberOfLines={2}>
                {service.description}
              </Text>
              <View style={styles.listFooter}>
                <Text style={styles.listPrice}>{formatUsd(service.priceCents)}</Text>
                <Pressable
                  onPress={onSelect}
                  accessibilityRole="button"
                  accessibilityLabel={selected ? `${service.name} selected` : `Add ${service.name}`}
                  hitSlop={8}
                  style={[styles.listToggle, selected && styles.listToggleSelected]}
                >
                  <MaterialCommunityIcons
                    name={selected ? 'check' : 'plus'}
                    size={22}
                    color={selected ? theme.paper : theme.plum}
                  />
                </Pressable>
              </View>
            </Pressable>
            <Image source={photo} style={styles.listThumb} accessibilityIgnoresInvertColors />
          </View>
          <Pressable
            onPress={() => setDetailsOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`Details for ${service.name}`}
            hitSlop={8}
            style={styles.listDetailsLink}
          >
            <Text style={styles.detailsBtnText}>Full menu details</Text>
          </Pressable>
        </View>
        {detailsSheet}
      </>
    );
  }

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

      {detailsSheet}
    </>
  );
}

const styles = StyleSheet.create({
  listCard: {
    width: '100%',
    borderRadius: theme.radii.lg,
    backgroundColor: theme.paper,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
    overflow: 'hidden',
  },
  listCardSelected: {
    borderColor: theme.plum,
    borderWidth: 1.5,
  },
  listBody: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  listTextCol: { flex: 1, minWidth: 0 },
  listTitle: { fontSize: 17, fontWeight: '600', color: theme.ink },
  listDuration: { marginTop: 2, fontSize: 13, color: theme.muted },
  listDescription: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: theme.muted,
  },
  listFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listPrice: { fontSize: 16, fontWeight: '700', color: theme.ink },
  listToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: theme.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
  },
  listToggleSelected: {
    borderColor: theme.plum,
    backgroundColor: theme.plum,
  },
  listThumb: {
    width: 72,
    height: 72,
    borderRadius: theme.radii.md,
    backgroundColor: theme.line,
  },
  listDetailsLink: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.line,
    alignItems: 'center',
  },
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
  },
  sheetContent: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  sheetLukePhoto: {
    width: '100%',
    height: 132,
    maxHeight: 132,
    borderRadius: theme.radii.lg,
    marginBottom: 10,
  },
  sheetLukeLabel: {
    ...monoLabel,
    fontSize: 10,
    color: theme.plum,
    marginBottom: 4,
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
