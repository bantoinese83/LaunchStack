import { describe, expect, test } from 'vitest';
import { readApiError } from './read-api-error';

describe('readApiError', () => {
  test('returns error field from JSON body', async () => {
    const response = new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    await expect(readApiError(response, 'fallback')).resolves.toBe('Forbidden');
  });

  test('returns fallback when body is not JSON', async () => {
    const response = new Response('not json', { status: 500 });
    await expect(readApiError(response, 'fallback')).resolves.toBe('fallback');
  });
});
