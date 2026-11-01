import { describe, expect, it } from 'vitest';
import { membershipSubscribeLabel, packageBuyLabel } from './plans-ui';

describe('plans UI labels', () => {
  it('formats subscribe and package CTAs', () => {
    expect(membershipSubscribeLabel('The Glow')).toBe('Subscribe — The Glow');
    expect(packageBuyLabel(4)).toBe('Buy 4-blowout package');
  });
});
