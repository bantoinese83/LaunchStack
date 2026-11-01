import { describe, expect, it } from 'vitest';
import { HOUSE_CALL_POLICIES } from './policies';

describe('HOUSE_CALL_POLICIES', () => {
  it('uses client-facing rules copy and Appointment time heading', () => {
    const titles = HOUSE_CALL_POLICIES.map((p) => p.title);
    expect(titles).toEqual(['Clean Hair', 'Seating', 'Power', 'Appointment time']);
  });

  it('mentions hose attachment for in-home wash', () => {
    const clean = HOUSE_CALL_POLICIES.find((p) => p.id === 'clean_hair');
    expect(clean?.body).toMatch(/hose attachment/i);
  });
});
