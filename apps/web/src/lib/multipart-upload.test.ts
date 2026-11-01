import { describe, expect, it } from 'vitest';
import { readMultipartFile } from './multipart-upload';

describe('readMultipartFile', () => {
  it('returns null for missing or string fields', async () => {
    const empty = new FormData();
    expect(await readMultipartFile(empty)).toBeNull();

    const withString = new FormData();
    withString.set('file', 'not-a-file');
    expect(await readMultipartFile(withString)).toBeNull();
  });

  it('reads File entries from FormData (browser uploads)', async () => {
    const form = new FormData();
    const file = new File([new Uint8Array([1, 2, 3])], 'inspo.jpg', { type: 'image/jpeg' });
    form.set('file', file);

    const result = await readMultipartFile(form);
    expect(result).toMatchObject({
      name: 'inspo.jpg',
      type: 'image/jpeg',
      size: 3,
    });
    expect(result?.data).toEqual(Buffer.from([1, 2, 3]));
  });

  it('reads Blob entries (React Native FormData)', async () => {
    const form = new FormData();
    const blob = new Blob(['avatar-bytes'], { type: 'image/png' });
    form.append('file', blob, 'avatar.png');

    const result = await readMultipartFile(form);
    expect(result?.name).toBe('avatar.png');
    expect(result?.type).toBe('image/png');
    expect(result?.data.toString()).toBe('avatar-bytes');
  });
});
