import { describe, expect, test } from 'vitest';
import { extractBearerToken } from './route-auth';

describe('extractBearerToken', () => {
  test('parses Bearer tokens', () => {
    const req = new Request('https://example.com', {
      headers: { authorization: 'Bearer abc.def.ghi' },
    });
    expect(extractBearerToken(req)).toBe('abc.def.ghi');
  });

  test('returns null when header is missing or malformed', () => {
    expect(extractBearerToken(new Request('https://example.com'))).toBeNull();
    expect(
      extractBearerToken(
        new Request('https://example.com', { headers: { authorization: 'Basic xyz' } })
      )
    ).toBeNull();
  });
});
