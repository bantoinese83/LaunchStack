import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';
import { createSupabaseMobileClient } from '@template/api/mobile';
import { theme } from '@template/mobile-ui';
import { fetchClientProfile } from '../../lib/mysticApi';

type Props = {
  focused: boolean;
  color: ColorValue;
  size: number;
};

export function NativeAccountTabIcon({ focused, color, size }: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseMobileClient();
    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session?.user.id) return;
      void fetchClientProfile()
        .then((res) => setAvatarUrl(res.profile?.avatar_url ?? null))
        .catch(() => {
          /* optional */
        });
    });
  }, []);

  if (avatarUrl) {
    const dim = size + 2;
    return (
      <View
        style={[
          styles.ring,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            borderColor: focused ? theme.gold : theme.line,
          },
        ]}
      >
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: dim - 4, height: dim - 4, borderRadius: (dim - 4) / 2 }}
        />
      </View>
    );
  }

  return (
    <MaterialCommunityIcons
      name={focused ? 'account-circle' : 'account-circle-outline'}
      size={size + 1}
      color={color}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
});
