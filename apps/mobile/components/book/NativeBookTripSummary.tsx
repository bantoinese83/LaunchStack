import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  formatUsd,
  formatVisitWhen,
  getServiceById,
  type BookingFlowStep,
  type ServiceId,
} from '@template/mystic';
import { monoLabel, theme } from '@template/mobile-ui';

type Props = {
  step: BookingFlowStep;
  serviceId: ServiceId;
  scheduledAt: Date | null;
  addressLine1: string;
  estimateCents: number | null;
};

export function NativeBookTripSummary({
  step,
  serviceId,
  scheduledAt,
  addressLine1,
  estimateCents,
}: Props) {
  if (step === 'service') return null;

  let serviceName: string = serviceId;
  try {
    serviceName = getServiceById(serviceId).name;
  } catch {
    /* keep id */
  }

  return (
    <View style={styles.box} accessibilityRole="summary">
      <Text style={styles.eyebrow}>Your house call</Text>
      <Text style={styles.title}>{serviceName}</Text>
      <Text style={styles.row}>
        <Text style={styles.label}>When </Text>
        {scheduledAt ? formatVisitWhen(scheduledAt.toISOString()) : 'Pick date & time'}
      </Text>
      <Text style={styles.row}>
        <Text style={styles.label}>Where </Text>
        {addressLine1.trim() || 'Add your address'}
      </Text>
      <Text style={styles.row}>
        <Text style={styles.label}>Estimate </Text>
        {estimateCents != null ? formatUsd(estimateCents) : 'After time & address'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginBottom: 16,
    padding: 14,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
  },
  eyebrow: { ...monoLabel, color: theme.plum, fontSize: 10 },
  title: { marginTop: 4, fontSize: 17, fontWeight: '600', color: theme.ink },
  row: { marginTop: 8, fontSize: 13, color: theme.ink, lineHeight: 18 },
  label: { color: theme.muted, fontWeight: '500' },
});
