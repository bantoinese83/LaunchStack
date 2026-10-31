import { test, expect } from '@playwright/test';

test('book flow page is reachable', async ({ page }) => {
  await page.goto('/book');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('verify email page renders', async ({ page }) => {
  await page.goto('/verify-email?email=client@example.com');
  await expect(page.getByText(/verification/i)).toBeVisible();
});
