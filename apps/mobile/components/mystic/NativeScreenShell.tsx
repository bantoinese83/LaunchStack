import React from 'react';
import { ScrollView, View, type RefreshControlProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { nativeScreenStyles } from './nativeScreenStyles';

type Props = {
  children: React.ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
};

/** Centered content column with consistent horizontal padding */
export function NativeScreenShell({ children, refreshControl }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={nativeScreenStyles.scroll}
      contentContainerStyle={[
        nativeScreenStyles.container,
        {
          paddingTop: Math.max(insets.top, 8) + 8,
          paddingBottom: Math.max(insets.bottom, 16) + 32,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
    >
      <View style={nativeScreenStyles.stack}>{children}</View>
    </ScrollView>
  );
}
