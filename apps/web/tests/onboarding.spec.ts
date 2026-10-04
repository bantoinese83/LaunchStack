import { expect, test } from '@playwright/test';

test('signup page is the start of onboarding', async ({ page }) => {
  await page.goto('/signup');
  await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible();
  await expect(page.getByLabel('Full Name')).toBeVisible();
  await expect(page.getByLabel('Email Address')).toBeVisible();
  await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
});

test('onboarding is session-gated', async ({ page }) => {
  await page.goto('/onboarding');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
});
