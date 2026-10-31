import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getErrorMessage } from '@template/validation';
import { NativeAlert, NativeButton, monoLabel, theme } from '@template/mobile-ui';
import { startGoogleOAuth } from '../../../lib/auth/oauth';

export function OAuthButtons({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <View style={styles.wrap}>
      <NativeButton
        title="Continue with Google"
        variant="outline"
        isLoading={pending}
        onPress={async () => {
          setError(null);
          setPending(true);
          try {
            await startGoogleOAuth();
            onSuccess();
          } catch (err) {
            setError(getErrorMessage(err, 'OAuth sign-in failed'));
          } finally {
            setPending(false);
          }
        }}
        style={styles.btn}
      />
      {error ? <NativeAlert message={error} /> : null}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', marginBottom: 8 },
  btn: { width: '100%' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.line },
  dividerText: { ...monoLabel, fontSize: 11, color: theme.muted, textTransform: 'uppercase' },
});
