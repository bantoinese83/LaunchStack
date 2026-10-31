import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { MYSTIC_EMPTY_CONTENT, type MysticEmptyVariant } from '@template/mystic';
import { displayTitle, theme } from '@template/mobile-ui';

const ILLUSTRATIONS: Record<string, ImageSourcePropType> = {
  'visits.jpg': require('../../assets/illustrations/empty/visits.jpg'),
  'messages.jpg': require('../../assets/illustrations/empty/messages.jpg'),
  'calendar.jpg': require('../../assets/illustrations/empty/calendar.jpg'),
  'clients.jpg': require('../../assets/illustrations/empty/clients.jpg'),
  'referrals.jpg': require('../../assets/illustrations/empty/referrals.jpg'),
};

type Props = {
  variant: MysticEmptyVariant;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
};

export function NativeEmptyState({ variant, title, description, action, compact = false }: Props) {
  const content = MYSTIC_EMPTY_CONTENT[variant];
  const heading = title ?? content.title;
  const body = description ?? content.description;
  const source = ILLUSTRATIONS[content.illustration] ?? ILLUSTRATIONS['visits.jpg'];

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]} accessibilityRole="text">
      <View style={[styles.artFrame, compact && styles.artFrameCompact]}>
        <Image
          source={source}
          style={styles.art}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>
      <Text style={[styles.title, compact && styles.titleCompact]}>{heading}</Text>
      <Text style={[styles.body, compact && styles.bodyCompact]}>{body}</Text>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
  },
  wrapCompact: { paddingVertical: 20 },
  artFrame: {
    width: 168,
    height: 168,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    backgroundColor: theme.accentSoft,
  },
  artFrameCompact: { width: 132, height: 132 },
  art: { width: '100%', height: '100%' },
  title: {
    ...displayTitle,
    fontSize: 20,
    marginTop: 20,
    textAlign: 'center',
    color: theme.ink,
  },
  titleCompact: { fontSize: 17, marginTop: 14 },
  body: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: theme.muted,
    maxWidth: 300,
  },
  bodyCompact: { fontSize: 13 },
  action: { marginTop: 20, width: '100%', maxWidth: 280 },
});
