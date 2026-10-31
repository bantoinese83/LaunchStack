import React from 'react';
import { ScrollView, View, type RefreshControlProps } from 'react-native';
import { nativeScreenStyles } from './nativeScreenStyles';

type Props = {
  children: React.ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
};

/** Centered content column with consistent horizontal padding */
export function NativeScreenShell({ children, refreshControl }: Props) {
  return (
    <ScrollView
      style={nativeScreenStyles.scroll}
      contentContainerStyle={nativeScreenStyles.container}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
    >
      <View style={nativeScreenStyles.stack}>{children}</View>
    </ScrollView>
  );
}
