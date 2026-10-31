import { describe, expect, it } from 'vitest';
import { readCheckoutIdempotencyKey } from './checkout-idempotency';

describe('readCheckoutIdempotencyKey', () => {
  it('prefers Idempotency-Key header', () => {
    const req = new Request('http://localhost', {
      headers: { 'Idempotency-Key': 'header-key-12345678' },
    });
    expect(readCheckoutIdempotencyKey(req, { idempotencyKey: 'body-key-12345678' })).toBe(
      'header-key-12345678'
    );
  });

  it('rejects keys shorter than 8 chars', () => {
    const req = new Request('http://localhost', {
      headers: { 'Idempotency-Key': 'short' },
    });
    expect(readCheckoutIdempotencyKey(req, {})).toBeUndefined();
  });
});
