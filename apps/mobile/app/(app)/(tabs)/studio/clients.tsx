import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@template/mobile-ui';
import { NativeEmptyState } from '../../../../components/mystic/NativeEmptyState';
import { useStudioAccess } from '../../../../hooks/useStudioAccess';
import { fetchStudioClients } from '../../../../lib/studioApi';

type ClientRow = {
  user_id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
};

export default function StudioClientsScreen() {
  const router = useRouter();
  const { workspaceId } = useStudioAccess();
  const [clients, setClients] = useState<ClientRow[]>([]);

  const load = useCallback(() => {
    if (!workspaceId) return;
    void fetchStudioClients(workspaceId).then((data) => {
      setClients(data.clients ?? []);
    });
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {clients.length === 0 ? (
        <NativeEmptyState variant="clients" />
      ) : (
        clients.map((client) => {
          const name = client.full_name?.trim() || client.email || 'Client';
          return (
            <Pressable
              key={client.user_id}
              style={styles.row}
              onPress={() =>
                router.push({
                  pathname: '/(app)/(tabs)/studio/thread/[clientUserId]',
                  params: { clientUserId: client.user_id, clientName: name },
                })
              }
            >
              <Text style={styles.name}>{name}</Text>
              {client.phone ? <Text style={styles.muted}>{client.phone}</Text> : null}
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20 },
  row: {
    padding: 16,
    marginBottom: 10,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
  },
  name: { fontWeight: '600', color: theme.ink },
  muted: { marginTop: 4, fontSize: 13, color: theme.muted },
});
