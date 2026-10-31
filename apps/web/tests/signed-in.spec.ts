import { test, expect } from '@playwright/test';

const email = process.env.E2E_EMAIL ?? 'demo@launchstack.com';
const password = process.env.E2E_PASSWORD ?? 'LaunchStack!demo';

test.describe('signed-in smoke', () => {
  test.skip(!process.env.E2E_SIGNED_IN, 'Set E2E_SIGNED_IN=1 with valid Supabase credentials');

  test('account page after login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/account|\/book/, { timeout: 15000 });
    await expect(page.locator('body')).toBeVisible();
  });
});
