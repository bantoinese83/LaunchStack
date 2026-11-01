/**
 * Smoke tests for the public book flow UI (web). Shared behavior is also locked in
 * packages/mystic/src/book-flow-parity.test.ts.
 */
import { formatBookingSlotLabel } from '@template/mystic';
import { test, expect } from '@playwright/test';

test.describe('Book flow — UI smoke', () => {
  test('service step shows continue and no booking referral-code field', async ({ page }) => {
    await page.goto('/book');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/book/i);
    await expect(page.getByText('Referral code (optional)')).toHaveCount(0);

    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('label').filter({ hasText: /^Date$/ })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: /^Time$/ })).toBeVisible();
  });

  test('time step uses 12-hour labels when slots load', async ({ page }) => {
    await page.goto('/book');
    await page.getByRole('button', { name: 'Continue' }).click();

    const timeButtons = page.getByRole('button', { name: /\b(AM|PM)\b/ });
    const count = await timeButtons.count();
    if (count === 0) {
      test.skip(true, 'No open slots on the default date');
    }

    const firstLabel = (await timeButtons.first().innerText()).trim();
    expect(formatBookingSlotLabel('13:00')).toBe('1 PM');
    expect(firstLabel).toMatch(/\b(AM|PM)\b/);
    await expect(page.getByRole('button', { name: /^\d{1,2}:\d{2}$/ })).toHaveCount(0);
  });
});
