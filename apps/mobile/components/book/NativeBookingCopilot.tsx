import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import type { ServiceId } from '@template/mystic';
import { NativeButton, handAccent, theme } from '@template/mobile-ui';
import { NativeAiOrb } from '../mystic/NativeAiOrb';

export type NativeBookingCopilotExtras = {
  clarifyingQuestion?: string;
  alternatives?: { serviceId: string; serviceName?: string; why: string }[];
} | null;

type Props = {
  prompt: string;
  onPromptChange: (value: string) => void;
  busy: boolean;
  hint: string | null;
  extras: NativeBookingCopilotExtras;
  onSubmit: () => void;
  onPickService: (serviceId: ServiceId) => void;
  /** Lift FAB when a bottom sticky bar is shown (book step actions). */
  fabBottomOffset?: number;
};

function CopilotBody({
  prompt,
  onPromptChange,
  busy,
  hint,
  extras,
  onSubmit,
  onPickService,
}: Props) {
  return (
    <View style={styles.body}>
      <View style={styles.headerRow}>
        <NativeAiOrb active={busy} size="sm" label="Booking concierge" />
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>Booking copilot</Text>
          <Text style={styles.lede}>Describe the look — I’ll match a service and tags.</Text>
        </View>
      </View>
      <TextInput
        value={prompt}
        onChangeText={onPromptChange}
        placeholder="Wedding guest, soft waves…"
        multiline
        style={styles.input}
        placeholderTextColor={theme.muted}
        textAlignVertical="top"
      />
      <NativeButton
        title={busy ? 'Matching…' : 'Recommend a service'}
        variant="primary"
        isLoading={busy}
        onPress={onSubmit}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {extras?.clarifyingQuestion ? (
        <Text style={styles.clarify}>Still unsure? {extras.clarifyingQuestion}</Text>
      ) : null}
      {extras?.alternatives?.map((alt) => (
        <Pressable
          key={alt.serviceId}
          onPress={() => onPickService(alt.serviceId as ServiceId)}
          style={styles.altRow}
          accessibilityRole="button"
        >
          <Text style={styles.altTitle}>{alt.serviceName ?? alt.serviceId}</Text>
          <Text style={styles.altWhy}>{alt.why}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function NativeBookingCopilot({ fabBottomOffset = 24, ...props }: Props) {
  const [open, setOpen] = useState(false);
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(width * 0.92, 360);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.fab, { bottom: fabBottomOffset }]}
        accessibilityRole="button"
        accessibilityLabel="Open booking copilot"
      >
        <NativeAiOrb active={props.busy} size="xs" label="" />
        <Text style={styles.fabLabel}>Copilot</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setOpen(false)}
            accessibilityLabel="Close"
          />
          <View style={[styles.panel, { width: panelWidth }]}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Booking copilot</Text>
              <Pressable
                onPress={() => setOpen(false)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>
            <CopilotBody
              {...props}
              onSubmit={() => {
                props.onSubmit();
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    zIndex: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 16,
    borderRadius: 999,
    backgroundColor: theme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
    shadowColor: '#1a1f18',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabLabel: { fontSize: 14, fontWeight: '600', color: theme.ink },
  modalRoot: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(26,31,24,0.45)' },
  panel: {
    flex: 1,
    maxHeight: '100%',
    backgroundColor: theme.surface,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
    paddingBottom: 24,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
  },
  panelTitle: { ...handAccent, fontSize: 24 },
  close: { fontSize: 18, color: theme.muted, padding: 4 },
  body: { padding: 16, gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerCopy: { flex: 1, minWidth: 0 },
  kicker: handAccent,
  lede: { marginTop: 2, fontSize: 12, color: theme.muted, lineHeight: 16 },
  input: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
    backgroundColor: theme.paper,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.ink,
  },
  hint: { fontSize: 13, lineHeight: 18, color: theme.muted },
  clarify: { fontSize: 13, lineHeight: 18, color: theme.plum },
  altRow: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
    backgroundColor: theme.paper,
    padding: 10,
  },
  altTitle: { fontSize: 13, fontWeight: '600', color: theme.accent },
  altWhy: { marginTop: 2, fontSize: 12, color: theme.muted },
});
