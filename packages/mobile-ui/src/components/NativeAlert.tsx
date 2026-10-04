import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export const NativeAlert: React.FC<{ message: string }> = ({ message }) => (
  <View style={styles.alert}>
    <Text style={styles.alertText}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  alert: {
    width: '100%',
    backgroundColor: '#FEF3F2',
    borderColor: '#FECDCA',
    borderWidth: 1,
    borderRadius: theme.radii.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  alertText: {
    color: theme.danger,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
