import { describe, expect, it } from 'vitest';
import {
  buildStudioAnalyticsSummary,
  studioAnalyticsDelta,
  studioAnalyticsPeriodRange,
} from './studio-analytics';

describe('studioAnalyticsPeriodRange', () => {
  it('mtd starts on the first of the month', () => {
    const now = new Date('2026-10-31T15:00:00');
    const range = studioAnalyticsPeriodRange('mtd', now);
    expect(range.start.toISOString()).toBe(new Date(2026, 9, 1, 0, 0, 0, 0).toISOString());
  });
});

describe('buildStudioAnalyticsSummary', () => {
  const now = new Date('2026-10-15T12:00:00');

  it('counts revenue only from completed visits and excludes canceled from bookings', () => {
    const summary = buildStudioAnalyticsSummary(
      [
        {
          service_id: 'blowout',
          quote_cents: 10_000,
          tip_cents: 2000,
          status: 'completed',
          starts_at: '2026-10-10T14:00:00.000Z',
        },
        {
          service_id: 'haircut',
          quote_cents: 8000,
          tip_cents: 0,
          status: 'no_show',
          starts_at: '2026-10-11T14:00:00.000Z',
        },
        {
          service_id: 'blowout',
          quote_cents: 10_000,
          tip_cents: 0,
          status: 'canceled',
          starts_at: '2026-10-12T14:00:00.000Z',
        },
        {
          service_id: 'updo',
          quote_cents: 15_000,
          tip_cents: 0,
          status: 'confirmed',
          starts_at: '2026-10-14T14:00:00.000Z',
        },
      ],
      'mtd',
      now
    );

    expect(summary.bookingCount).toBe(3);
    expect(summary.completedCount).toBe(1);
    expect(summary.noShowCount).toBe(1);
    expect(summary.canceledCount).toBe(1);
    expect(summary.upcomingCount).toBe(1);
    expect(summary.revenueCents).toBe(12_000);
    expect(summary.tipCents).toBe(2000);
    expect(summary.avgTicketCents).toBe(12_000);
    expect(summary.completionRate).toBe(0.5);
    expect(summary.noShowRate).toBe(0.5);
    expect(summary.byService[0]?.serviceId).toBe('blowout');
  });

  it('compares against the prior window of equal length', () => {
    const summary = buildStudioAnalyticsSummary(
      [
        {
          service_id: 'blowout',
          quote_cents: 10_000,
          tip_cents: 0,
          status: 'completed',
          starts_at: '2026-10-05T14:00:00.000Z',
        },
        {
          service_id: 'blowout',
          quote_cents: 5000,
          tip_cents: 0,
          status: 'completed',
          starts_at: '2026-09-20T14:00:00.000Z',
        },
      ],
      'mtd',
      now
    );
    expect(summary.prior.revenueCents).toBe(5000);
    expect(summary.prior.completedCount).toBe(1);
  });
});

describe('studioAnalyticsDelta', () => {
  it('returns null when prior is zero and current is positive', () => {
    expect(studioAnalyticsDelta(10, 0)).toBeNull();
  });

  it('reports percent change', () => {
    expect(studioAnalyticsDelta(120, 100)).toEqual({ pct: 20, direction: 'up' });
    expect(studioAnalyticsDelta(80, 100)).toEqual({ pct: 20, direction: 'down' });
  });
});
