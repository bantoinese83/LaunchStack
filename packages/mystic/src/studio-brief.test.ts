import { describe, expect, it } from 'vitest';
import { buildStudioRoadBrief } from './studio-brief';

describe('buildStudioRoadBrief', () => {
  it('coins a clear-road brief when empty', () => {
    const brief = buildStudioRoadBrief([], {});
    expect(brief.metricLabel).toBe('Clear road');
    expect(brief.primaryAction).toBe('blocked');
    expect(brief.stopsToday).toBe(0);
  });

  it('surfaces next stop timing for today', () => {
    const starts = new Date();
    starts.setHours(starts.getHours() + 2, 0, 0, 0);
    const brief = buildStudioRoadBrief(
      [
        {
          id: 'a1',
          starts_at: starts.toISOString(),
          service_id: 'blowout',
          status: 'confirmed',
          client_user_id: 'u1',
        },
      ],
      { u1: 'Maya' }
    );
    expect(brief.stopsToday).toBe(1);
    expect(brief.nextStop?.serviceName).toBe('Blowout');
    expect(brief.insight).toContain('Maya');
    expect(brief.primaryAction).toBe('first_stop');
  });
});
