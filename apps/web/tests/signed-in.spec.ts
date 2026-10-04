import { expect, test } from '@playwright/test';

const email = process.env.E2E_EMAIL ?? 'demo@launchstack.com';
const password = process.env.E2E_PASSWORD ?? 'LaunchStack!demo';
const hasLocalAuth = Boolean(process.env.E2E_SIGNED_IN);

test.describe('signed-in workspace', () => {
  test.skip(!hasLocalAuth, 'Set E2E_SIGNED_IN=1 after `pnpm db:reset` to run live auth E2E.');

  test('demo user reaches the dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });
  });
});
