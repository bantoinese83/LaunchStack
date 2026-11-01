import { describe, expect, it } from 'vitest';
import { BOOKING_ENTITLEMENT_LABEL } from './booking-entitlement';
import { BOOK_FLOW_COPY } from './book-flow-ui';
import { BOOKING_TIP_PERCENT_PRESETS } from './booking-tips';
import { MYSTIC_EMPTY_CONTENT, visitsTabEmptyContent } from './empty-states';

describe('book flow product contract', () => {
  it('exposes 18/20/25 tip presets (no legacy 15%)', () => {
    expect(BOOKING_TIP_PERCENT_PRESETS).toEqual([0, 18, 20, 25]);
  });

  it('labels all entitlement options for plan picker', () => {
    expect(Object.keys(BOOKING_ENTITLEMENT_LABEL).sort()).toEqual(
      ['membership', 'none', 'package'].sort()
    );
  });

  it('defines shared UI copy for cross-platform book flow', () => {
    expect(BOOK_FLOW_COPY.preferencesSection).toBe('Preferences & referral');
    expect(BOOK_FLOW_COPY.referredByPlaceholder).toBe('Referred by (name)');
    expect(BOOK_FLOW_COPY.tipInCash).toBe('Tip in cash');
  });

  it('empty states omit deprecated “full kit” book subtext', () => {
    const blob = JSON.stringify(MYSTIC_EMPTY_CONTENT);
    expect(blob).not.toMatch(/rolls up with the full kit/i);
  });

  it('visits tab empty copy differs for upcoming vs past', () => {
    expect(visitsTabEmptyContent('upcoming').title).toMatch(/caught up/i);
    expect(visitsTabEmptyContent('past').title).toMatch(/past visits/i);
  });
});
