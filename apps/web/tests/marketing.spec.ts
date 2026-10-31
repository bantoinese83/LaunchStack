import { test, expect } from '@playwright/test';

test('marketing home loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Mystic Hair Co./);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Luxury hair/i);
});
