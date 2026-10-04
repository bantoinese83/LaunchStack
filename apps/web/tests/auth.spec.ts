import { expect, test } from '@playwright/test';

test('login page exposes password, OAuth, and forgot-password paths', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  await expect(page.getByLabel('Email Address')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue with GitHub' })).toBeVisible();
  await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
});

test('unauthenticated dashboard visits are sent to login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
});

test('forgot password page is reachable', async ({ page }) => {
  await page.goto('/forgot-password');
  await expect(page.getByRole('heading', { name: /reset your password/i })).toBeVisible();
  await expect(page.getByLabel('Email Address')).toBeVisible();
});
