import { test, expect } from '@playwright/test';

test('has title and interactive hero', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/LaunchStack/);

  // Expect the hero heading to be visible
  const heroHeading = page.locator('h1').first();
  await expect(heroHeading).toBeVisible();
});
