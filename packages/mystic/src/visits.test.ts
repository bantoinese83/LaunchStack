import { describe, expect, it } from 'vitest';
import {
  DOOR_TIMER_FINAL_SECONDS,
  DOOR_TIMER_URGENT_SECONDS,
  doorTimerAnnouncement,
  doorTimerElapsedFraction,
  doorTimerTone,
} from './visits';

describe('doorTimerTone', () => {
  it('classifies each threshold', () => {
    expect(doorTimerTone(0)).toBe('expired');
    expect(doorTimerTone(-5)).toBe('expired');
    expect(doorTimerTone(DOOR_TIMER_FINAL_SECONDS)).toBe('final');
    expect(doorTimerTone(DOOR_TIMER_FINAL_SECONDS + 1)).toBe('urgent');
    expect(doorTimerTone(DOOR_TIMER_URGENT_SECONDS)).toBe('urgent');
    expect(doorTimerTone(DOOR_TIMER_URGENT_SECONDS + 1)).toBe('calm');
  });
});

describe('doorTimerAnnouncement', () => {
  it('stays stable within a tone so a live region does not announce every tick', () => {
    expect(doorTimerAnnouncement(600)).toBe(doorTimerAnnouncement(599));
    expect(doorTimerAnnouncement(100)).toBe(doorTimerAnnouncement(99));
    expect(doorTimerAnnouncement(20)).toBe(doorTimerAnnouncement(1));
  });

  it('changes copy only when a threshold is crossed', () => {
    expect(doorTimerAnnouncement(DOOR_TIMER_URGENT_SECONDS + 1)).not.toBe(
      doorTimerAnnouncement(DOOR_TIMER_URGENT_SECONDS)
    );
    expect(doorTimerAnnouncement(DOOR_TIMER_FINAL_SECONDS + 1)).not.toBe(
      doorTimerAnnouncement(DOOR_TIMER_FINAL_SECONDS)
    );
    expect(doorTimerAnnouncement(1)).not.toBe(doorTimerAnnouncement(0));
  });

  it('tells the client to answer the door when time is short', () => {
    expect(doorTimerAnnouncement(90)).toMatch(/answer the door/i);
    expect(doorTimerAnnouncement(10)).toMatch(/answer the door/i);
    expect(doorTimerAnnouncement(0)).toMatch(/ended/i);
  });
});

describe('doorTimerElapsedFraction', () => {
  it('runs 0 → 1 as the window drains', () => {
    expect(doorTimerElapsedFraction(600, 600)).toBe(0);
    expect(doorTimerElapsedFraction(300, 600)).toBe(0.5);
    expect(doorTimerElapsedFraction(0, 600)).toBe(1);
  });

  it('clamps out-of-range input and guards a zero window', () => {
    expect(doorTimerElapsedFraction(700, 600)).toBe(0);
    expect(doorTimerElapsedFraction(0, 0)).toBe(1);
    expect(doorTimerElapsedFraction(0, Number.NaN)).toBe(1);
  });
});
