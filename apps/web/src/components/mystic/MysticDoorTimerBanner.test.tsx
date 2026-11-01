/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { MysticDoorTimerBanner } from './MysticDoorTimerBanner';

function renderBanner(secondsFromNow: number) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-08-01T12:00:00Z'));
  const endsAt = new Date(Date.now() + secondsFromNow * 1000).toISOString();
  return render(<MysticDoorTimerBanner endsAt={endsAt} />);
}

describe('MysticDoorTimerBanner', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('announces at thresholds instead of ticking every second', () => {
    const { container } = renderBanner(600);

    // A live region on the ticking countdown would announce every second and make
    // the door timer unusable with a screen reader.
    expect(container.querySelector('[aria-live]')).toBeNull();
    expect(screen.getByRole('status').textContent).toBe(
      'Luke is at your door — please answer when you can.'
    );
    expect(container.textContent).toContain('10:00 left');
  });

  test('shows a progress bar that drains as the timer runs down', () => {
    const { container } = renderBanner(300);
    const bar = screen.getByRole('progressbar');

    expect(bar.getAttribute('aria-valuetext')).toBe('5:00 left');
    expect(bar.getAttribute('aria-valuenow')).toBe('300');
    expect(bar.getAttribute('aria-valuemax')).toBe('300');

    const fill = container.querySelector<HTMLElement>('.mystic-progress-fill');
    expect(fill?.style.width).toBe('0%');
  });

  test('turns urgent and swaps the bar to the warning palette under two minutes', () => {
    const { container } = renderBanner(90);

    expect(screen.getByRole('status').textContent).toContain('About 2 minutes left');
    expect(container.querySelector('.mystic-progress-fill--danger')).not.toBeNull();
  });

  test('renders the ended state once the timer expires', () => {
    const { container } = renderBanner(-5);

    expect(screen.getByRole('status').textContent).toContain('Arrival window ended');
    expect(container.textContent).toContain('Luke has left');
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});
