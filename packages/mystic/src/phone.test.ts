import { describe, expect, it } from 'vitest';
import { formatUsPhoneInput, stripUsPhoneDigits } from './phone';

describe('formatUsPhoneInput', () => {
  it('formats partial and full US numbers with dashes', () => {
    expect(formatUsPhoneInput('3')).toBe('3');
    expect(formatUsPhoneInput('312')).toBe('312');
    expect(formatUsPhoneInput('3125')).toBe('312-5');
    expect(formatUsPhoneInput('3125550100')).toBe('312-555-0100');
    expect(formatUsPhoneInput('(312) 555-0100')).toBe('312-555-0100');
  });

  it('caps at 10 digits', () => {
    expect(formatUsPhoneInput('31255501001234')).toBe('312-555-0100');
  });
});

describe('stripUsPhoneDigits', () => {
  it('returns digits only for API storage', () => {
    expect(stripUsPhoneDigits('312-555-0100')).toBe('3125550100');
    expect(stripUsPhoneDigits('(312) 555-0100 ext 9')).toBe('3125550100');
  });
});
