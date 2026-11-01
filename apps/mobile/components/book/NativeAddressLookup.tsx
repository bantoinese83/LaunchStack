import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { AddressSuggestion } from '@template/mystic';
import { theme } from '@template/mobile-ui';
import { fetchAddressAutocomplete } from '../../lib/mysticApi';

export type HouseCallAddress = {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  notes: string;
  latitude?: number;
  longitude?: number;
};

type Props = {
  address: HouseCallAddress;
  onChange: (next: HouseCallAddress) => void;
  onSuggestionSelected?: (suggestion: AddressSuggestion) => void;
};

export function NativeAddressLookup({ address, onChange, onSuggestionSelected }: Props) {
  const [lookup, setLookup] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (lookup.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      setBusy(true);
      void fetchAddressAutocomplete(lookup.trim())
        .then((data) => setSuggestions(data.suggestions ?? []))
        .catch(() => setSuggestions([]))
        .finally(() => setBusy(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [lookup]);

  function pick(s: AddressSuggestion) {
    onChange({
      ...address,
      line1: s.line1,
      city: s.city,
      state: s.state,
      postalCode: s.postalCode,
      latitude: s.latitude,
      longitude: s.longitude,
    });
    setLookup('');
    setSuggestions([]);
    onSuggestionSelected?.(s);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Search address</Text>
      <TextInput
        placeholder="Start typing street, city, or ZIP…"
        value={lookup}
        onChangeText={setLookup}
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="words"
        returnKeyType="search"
        blurOnSubmit
      />
      {busy ? <Text style={styles.hint}>Looking up addresses…</Text> : null}
      {suggestions.length > 0 ? (
        <View style={styles.list}>
          {suggestions.map((s) => (
            <Pressable key={s.id} style={styles.row} onPress={() => pick(s)}>
              <Text style={styles.rowText} numberOfLines={2}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <TextInput
        placeholder="Street address"
        value={address.line1}
        onChangeText={(line1) => onChange({ ...address, line1 })}
        style={styles.input}
      />
      <View style={styles.rowFields}>
        <TextInput
          placeholder="City"
          value={address.city}
          onChangeText={(city) => onChange({ ...address, city })}
          style={[styles.input, styles.city]}
        />
        <TextInput
          placeholder="ST"
          value={address.state}
          onChangeText={(state) => onChange({ ...address, state: state.toUpperCase().slice(0, 2) })}
          style={[styles.input, styles.state]}
          maxLength={2}
          autoCapitalize="characters"
        />
      </View>
      <TextInput
        placeholder="ZIP"
        value={address.postalCode}
        onChangeText={(postalCode) =>
          onChange({ ...address, postalCode: postalCode.replace(/\D/g, '').slice(0, 5) })
        }
        style={styles.input}
        keyboardType="number-pad"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  label: { fontSize: 14, fontWeight: '600', color: theme.ink },
  input: {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: theme.radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.ink,
    backgroundColor: theme.surface,
  },
  hint: { fontSize: 12, color: theme.muted },
  list: {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    backgroundColor: theme.surface,
  },
  row: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.line,
  },
  rowText: { fontSize: 14, color: theme.ink },
  rowFields: { flexDirection: 'row', gap: 10 },
  city: { flex: 1 },
  state: { width: 64 },
});
