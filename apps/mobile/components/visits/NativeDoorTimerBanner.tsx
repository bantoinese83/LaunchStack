import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatCountdownMmSs, secondsUntil } from '@template/mystic';
import { theme } from '@template/mobile-ui';

export function NativeDoorTimerBanner({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState(() => secondsUntil(endsAt));

  useEffect(() => {
    setRemaining(secondsUntil(endsAt));
    const id = setInterval(() => setRemaining(secondsUntil(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (remaining <= 0) {
    return (
      <View style={[styles.box, styles.expired]}>
        <Text style={styles.expiredText}>Door timer ended — message Luke if you need help.</Text>
      </View>
    );
  }

  const urgent = remaining <= 120;

  return (
    <View
      style={[styles.box, urgent ? styles.urgent : styles.normal]}
      accessibilityLiveRegion="polite"
    >
      <Text style={[styles.title, urgent && styles.titleUrgent]}>
        Answer the door — {formatCountdownMmSs(remaining)} left
      </Text>
      <Text style={styles.hint}>Luke is waiting. Use Messages if you need a moment.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 10,
    padding: 12,
    borderRadius: theme.radii.md,
    borderWidth: 1,
  },
  normal: {
    borderColor: theme.accent,
    backgroundColor: `${theme.accent}14`,
  },
  urgent: {
    borderColor: theme.danger,
    backgroundColor: `${theme.danger}18`,
  },
  expired: {
    borderColor: theme.danger,
    backgroundColor: `${theme.danger}12`,
  },
  title: { fontSize: 14, fontWeight: '600', color: theme.chalk },
  titleUrgent: { color: theme.danger },
  hint: { marginTop: 4, fontSize: 12, color: theme.muted },
  expiredText: { fontSize: 13, color: theme.danger },
});
