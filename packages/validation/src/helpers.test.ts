import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { firstZodIssueMessage, getErrorMessage, slugifyWorkspaceName } from './helpers';

describe('firstZodIssueMessage', () => {
  test('returns the first issue message', () => {
    const result = z.string().min(3).safeParse('a');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(firstZodIssueMessage(result.error)).toBe(result.error.issues[0].message);
    }
  });

  test('uses fallback when issues are empty', () => {
    const error = new z.ZodError([]);
    expect(firstZodIssueMessage(error, 'Bad input')).toBe('Bad input');
  });
});

describe('slugifyWorkspaceName', () => {
  test('lowercases and hyphenates', () => {
    expect(slugifyWorkspaceName('Acme Labs Inc.')).toBe('acme-labs-inc');
  });

  test('trims leading and trailing hyphens', () => {
    expect(slugifyWorkspaceName('---Hello---')).toBe('hello');
  });
});

describe('getErrorMessage', () => {
  test('reads Error.message', () => {
    expect(getErrorMessage(new Error('boom'), 'fallback')).toBe('boom');
  });

  test('returns fallback for non-errors', () => {
    expect(getErrorMessage('nope', 'fallback')).toBe('fallback');
  });
});
