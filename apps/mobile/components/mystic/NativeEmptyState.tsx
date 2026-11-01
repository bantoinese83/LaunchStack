import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { MYSTIC_EMPTY_CONTENT, type MysticEmptyVariant } from '@template/mystic';
import { displayTitle, monoLabel, roadTrip, theme } from '@template/mobile-ui';
import { MYSTIC_EMPTY_ILLUSTRATIONS } from '../../constants/emptyIllustrations';
import { NativeFadeIn } from '../motion/NativeFadeIn';
type Props = {
  variant: MysticEmptyVariant;
  title?: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  compact?: boolean;
};

export function NativeEmptyState({
  variant,
  title,
  description,
  eyebrow,
  action,
  compact = false,
}: Props) {
  const content = MYSTIC_EMPTY_CONTENT[variant];
  const heading = title ?? content.title;
  const body =
    description ??
    (compact && content.compactDescription ? content.compactDescription : content.description);
  const kicker = eyebrow ?? content.eyebrow;
  const source =
    MYSTIC_EMPTY_ILLUSTRATIONS[content.illustration] ?? MYSTIC_EMPTY_ILLUSTRATIONS['visits.jpg'];

  return (
    <NativeFadeIn
      rise
      style={[styles.wrap, compact && styles.wrapCompact]}
      accessibilityRole="summary"
      accessibilityLabel={`${heading}. ${body}`}
    >
      {kicker ? <Text style={styles.eyebrow}>{kicker}</Text> : null}
      <View style={[styles.artFrame, compact && styles.artFrameCompact]}>
        <Image
          source={source}
          style={styles.art}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          accessible={false}
        />
      </View>
      {compact ? null : <View style={styles.hairline} />}
      <Text style={[styles.title, compact && styles.titleCompact]}>{heading}</Text>
      <Text style={[styles.body, compact && styles.bodyCompact]}>{body}</Text>
      {action ? <View style={styles.action}>{action}</View> : null}
    </NativeFadeIn>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 8,
    width: '100%',
  },
  wrapCompact: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  eyebrow: {
    ...monoLabel,
    color: theme.plum,
    marginBottom: 12,
    textAlign: 'center',
  },
  artFrame: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 1.15,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    backgroundColor: theme.chalkSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
  },
  artFrameCompact: {
    maxWidth: 168,
    aspectRatio: 1.2,
  },
  art: {
    width: '100%',
    height: '100%',
  },
  hairline: {
    ...roadTrip.hairline,
    maxWidth: 280,
    marginTop: 16,
    marginBottom: 4,
  },
  title: {
    ...displayTitle,
    fontSize: 22,
    marginTop: 12,
    textAlign: 'center',
    color: theme.ink,
    letterSpacing: -0.5,
  },
  titleCompact: {
    fontSize: 18,
    marginTop: 10,
  },
  body: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: theme.muted,
    maxWidth: 320,
  },
  bodyCompact: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  action: {
    marginTop: 20,
    width: '100%',
    maxWidth: 320,
    gap: 10,
  },
});
