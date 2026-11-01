import { describe, expect, it } from 'vitest';
import { buildDiceBearGallery, DICEBEAR_STYLES } from './dicebear';

describe('buildDiceBearGallery', () => {
  it('builds a scrollable grid of style × variant faces', () => {
    const gallery = buildDiceBearGallery('jordan', { variants: 3 });
    expect(gallery).toHaveLength(DICEBEAR_STYLES.length * 3);
    expect(gallery[0]?.url).toContain('api.dicebear.com');
    expect(gallery[0]?.url).toContain('/lorelei/');
  });

  it('changes looks when shuffled', () => {
    const a = buildDiceBearGallery('jordan', { variants: 2, shuffleKey: 'a' });
    const b = buildDiceBearGallery('jordan', { variants: 2, shuffleKey: 'b' });
    expect(a.map((i) => i.id).join('|')).not.toBe(b.map((i) => i.id).join('|'));
  });
});
