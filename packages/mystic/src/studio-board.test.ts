import { describe, expect, it } from 'vitest';
import { MYSTIC_INSPO_BATCH_MAX, chunkIds } from './studio-board';

describe('chunkIds', () => {
  it('keeps a short list in a single batch', () => {
    expect(chunkIds(['a', 'b', 'c'])).toEqual([['a', 'b', 'c']]);
  });

  it('splits a list longer than the endpoint cap into URL-safe batches', () => {
    const ids = Array.from({ length: 120 }, (_, i) => `id-${i}`);
    const batches = chunkIds(ids);

    expect(batches).toHaveLength(3);
    expect(batches[0]).toHaveLength(MYSTIC_INSPO_BATCH_MAX);
    expect(batches[1]).toHaveLength(MYSTIC_INSPO_BATCH_MAX);
    expect(batches[2]).toHaveLength(20);
    // Nothing lost, order preserved.
    expect(batches.flat()).toEqual(ids);
  });

  it('never returns an empty batch and handles an empty list', () => {
    expect(chunkIds([])).toEqual([]);
    expect(chunkIds(['a', 'b', 'c'], 1)).toEqual([['a'], ['b'], ['c']]);
    expect(chunkIds(['a'], 0)).toEqual([['a']]);
  });

  it('matches the cap the API schema enforces', () => {
    expect(MYSTIC_INSPO_BATCH_MAX).toBe(50);
  });
});
