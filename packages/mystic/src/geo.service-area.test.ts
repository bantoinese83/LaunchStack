import { describe, expect, it } from 'vitest';
import {
  MYSTIC_MAX_HOUSE_CALL_DISTANCE_MILES,
  distanceFromRiverNorthMiles,
  isWithinHouseCallServiceArea,
} from './geo';

describe('house-call service area', () => {
  it('accepts downtown Chicago distance', () => {
    const miles = distanceFromRiverNorthMiles(41.8781, -87.6298);
    expect(isWithinHouseCallServiceArea(miles)).toBe(true);
  });

  it('rejects far-away coordinates', () => {
    expect(isWithinHouseCallServiceArea(MYSTIC_MAX_HOUSE_CALL_DISTANCE_MILES + 1)).toBe(false);
    const miles = distanceFromRiverNorthMiles(40.7128, -74.006);
    expect(isWithinHouseCallServiceArea(miles)).toBe(false);
  });
});
