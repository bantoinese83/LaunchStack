import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HOUSE_CALL_POLICIES } from '@template/mystic';
import { theme } from '@template/mobile-ui';

/** Collapsible house-call prep on Up next — not only at checkout. */
export function NativeVisitPrep() {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.header}
      >
        <Text style={styles.title}>Before Luke arrives</Text>
        <Text style={styles.toggle}>{open ? 'Hide' : 'Show'}</Text>
      </Pressable>
      {open
        ? HOUSE_CALL_POLICIES.map((policy) => (
            <View key={policy.id} style={styles.policy}>
              <Text style={styles.policyTitle}>{policy.title}</Text>
              <Text style={styles.policyBody}>{policy.body}</Text>
            </View>
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    borderRadius: theme.radii.md,
    backgroundColor: theme.paper,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: { fontSize: 14, fontWeight: '600', color: theme.ink },
  toggle: { fontSize: 12, fontWeight: '600', color: theme.plum },
  policy: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.line,
    paddingTop: 8,
  },
  policyTitle: { fontSize: 13, fontWeight: '600', color: theme.ink },
  policyBody: { marginTop: 2, fontSize: 12, lineHeight: 17, color: theme.muted },
});
