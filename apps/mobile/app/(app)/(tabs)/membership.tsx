import React from 'react';
import { NativePlansScreen } from '../../../components/plans/NativePlansScreen';
import { NativeScreenShell } from '../../../components/mystic/NativeScreenShell';

export default function PlansTab() {
  return (
    <NativeScreenShell>
      <NativePlansScreen />
    </NativeScreenShell>
  );
}
