import { describe, expect, it } from 'vitest';
import {
  membershipSubscribeLabel,
  packageBuyAriaLabel,
  packageBuyLabel,
  packageRowTitle,
} from './plans-ui';

describe('plans UI labels', () => {
  it('formats subscribe and package CTAs', () => {
    expect(membershipSubscribeLabel('The Glow')).toBe('Subscribe — The Glow');
    expect(packageRowTitle(4)).toBe('4-visit pack');
    expect(packageBuyLabel()).toBe('Buy package');
    expect(packageBuyAriaLabel(4, '$160.00')).toBe('Buy 4-visit prepaid package, $160.00');
  });
});
