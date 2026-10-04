import { expect, test } from '@playwright/test';

test('login exposes magic link and passkey actions', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /email me a magic link/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /continue with a passkey/i })).toBeVisible();
});

test('verify-email page is reachable', async ({ page }) => {
  await page.goto('/verify-email?email=demo@launchstack.com');
  await expect(page.getByRole('heading', { name: /verify your email/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /resend verification email/i })).toBeVisible();
});

test('privacy and cookie policy pages exist', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { name: /privacy policy/i })).toBeVisible();
  await page.goto('/cookies');
  await expect(page.getByRole('heading', { name: /cookie policy/i })).toBeVisible();
});

test('pricing section offers checkout', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /start free/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /start trial/i })).toBeVisible();
});
