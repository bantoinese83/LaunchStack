import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  DOOR_TIMER_URGENT_SECONDS,
  doorTimerAnnouncement,
  doorTimerElapsedFraction,
  formatCountdownMmSs,
  secondsUntil,
} from '@template/mystic';
import { theme } from '@template/mobile-ui';

type DoorTimerClock = {
  /** Timestamp of the last tick — the countdown is derived from it. */
  nowMs: number;
  /** Which timer this window belongs to, so a new timer restarts the bar. */
  endsAt: string;
  /** Remaining seconds when this timer first rendered. */
  windowSeconds: number;
};

function initialClock(endsAt: string): DoorTimerClock {
  return { nowMs: Date.now(), endsAt, windowSeconds: secondsUntil(endsAt) };
}

export function NativeDoorTimerBanner({ endsAt }: { endsAt: string }) {
  const [clock, setClock] = useState(() => initialClock(endsAt));

  // A new door timer restarts the progress window (adjust state during render).
  if (clock.endsAt !== endsAt) {
    setClock(initialClock(endsAt));
  }

  useEffect(() => {
    const id = setInterval(() => setClock((prev) => ({ ...prev, nowMs: Date.now() })), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = secondsUntil(endsAt, clock.nowMs);
  const windowSeconds =
    clock.endsAt === endsAt ? clock.windowSeconds : secondsUntil(endsAt, clock.nowMs);
  const expired = remaining <= 0;
  const urgent = !expired && remaining <= DOOR_TIMER_URGENT_SECONDS;
  const elapsed = doorTimerElapsedFraction(remaining, windowSeconds);

  return (
    <View style={[styles.box, expired ? styles.expired : urgent ? styles.urgent : styles.normal]}>
      {expired ? (
        <Text style={styles.expiredText}>Luke has left — message him if you still need help.</Text>
      ) : (
        <>
          <Text style={[styles.title, urgent && styles.titleUrgent]}>
            Answer the door — {formatCountdownMmSs(remaining)} left
          </Text>
          <View
            style={styles.track}
            accessibilityRole="progressbar"
            accessibilityLabel="Time left to answer the door"
            accessibilityValue={{ min: 0, max: windowSeconds, now: remaining }}
          >
            <View
              style={[
                styles.fill,
                urgent && styles.fillUrgent,
                { width: `${Math.round(elapsed * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.hint}>Luke is waiting. Use Messages if you need a moment.</Text>
        </>
      )}
      {/*
        The visible countdown ticks every second, so it is deliberately NOT a live
        region. This status line only changes copy when the timer crosses a
        threshold, so VoiceOver / TalkBack announce it at 2:00, 0:30 and at the end.
      */}
      <Text style={styles.status} accessibilityLiveRegion="polite">
        {doorTimerAnnouncement(remaining)}
      </Text>
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
  track: {
    marginTop: 8,
    height: 3,
    borderRadius: theme.radii.pill,
    backgroundColor: `${theme.line}CC`,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.accent,
  },
  fillUrgent: { backgroundColor: theme.danger },
  hint: { marginTop: 6, fontSize: 12, color: theme.muted },
  expiredText: { fontSize: 13, color: theme.danger },
  status: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
});
