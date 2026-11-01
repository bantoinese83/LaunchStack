import { describe, expect, it } from 'vitest';
import { MYSTIC_STYLIST, mysticStylistCutoutUrl, mysticStylistPortraitUrl } from './catalog';

describe('MYSTIC_STYLIST', () => {
  it('exposes portrait path on web origin', () => {
    expect(MYSTIC_STYLIST.portraitPath).toMatch(/^\/marketing\//);
  });

  it('builds absolute portrait URL for mobile', () => {
    expect(mysticStylistPortraitUrl()).toBe(MYSTIC_STYLIST.portraitPath);
    expect(mysticStylistPortraitUrl('https://mystic.test/')).toBe(
      'https://mystic.test/marketing/stylist.jpg'
    );
  });

  it('exposes cutout path for hero overlays', () => {
    expect(MYSTIC_STYLIST.portraitCutoutPath).toMatch(/stylist-cutout\.png$/);
    expect(mysticStylistCutoutUrl('https://mystic.test')).toBe(
      'https://mystic.test/marketing/stylist-cutout.png'
    );
  });
});
