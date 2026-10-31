import React from 'react';
import { View } from 'react-native';
import { roadTrip } from '@template/mobile-ui';

/** Gold · plum · sage pinstripe — 60s road-trip poster cue (not literal VW). */
export function NativeRoadStripe() {
  return (
    <View style={roadTrip.stripe} accessibilityElementsHidden importantForAccessibility="no">
      <View style={roadTrip.stripeGold} />
      <View style={roadTrip.stripePlum} />
      <View style={roadTrip.stripeSage} />
    </View>
  );
}
