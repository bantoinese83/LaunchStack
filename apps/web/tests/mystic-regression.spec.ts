/**
 * Mystic regression matrix (web) — maps case types to automated checks.
 *
 * | Case type    | Coverage in this file                          |
 * |--------------|------------------------------------------------|
 * | Happy path   | Book + visits + messages shells load           |
 * | Negative     | Direct appointment POST disabled; auth gates     |
 * | Boundary     | Availability rejects bad date query            |
 * | Exceptional  | Unauthenticated API returns 401, not 500       |
 *
 * Signed-in flows: see signed-in.spec.ts (E2E_SIGNED_IN=1).
 */
import { test, expect } from '@playwright/test';

const MYSTIC_WORKSPACE = '33333333-3333-3333-3333-333333333333';

test.describe('Mystic — happy path (public shells)', () => {
  test('book flow heading', async ({ page }) => {
    await page.goto('/book');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/book/i);
  });

  test('visits page loads for guests', async ({ page }) => {
    await page.goto('/visits');
    await expect(page.locator('body')).toBeVisible();
  });

  test('messages redirects guests to sign in', async ({ page }) => {
    await page.goto('/messages');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/welcome back/i);
  });
});

test.describe('Mystic — negative / security', () => {
  test('POST /api/mystic/appointments is checkout-only (405)', async ({ request }) => {
    const res = await request.post('/api/mystic/appointments', {
      data: { workspaceId: MYSTIC_WORKSPACE },
    });
    expect(res.status()).toBe(405);
    const body = await res.json();
    expect(body.error).toMatch(/checkout\/booking/i);
  });

  test('inspo upload requires auth', async ({ request }) => {
    const res = await request.post('/api/mystic/appointments/inspo');
    expect(res.status()).toBe(401);
  });
});

test.describe('Mystic — exceptional (auth boundaries)', () => {
  test('blocked dates list requires studio auth', async ({ request }) => {
    const res = await request.get(`/api/mystic/blocked-dates?workspaceId=${MYSTIC_WORKSPACE}`);
    expect(res.status()).toBe(401);
  });

  test('appointments mine requires auth', async ({ request }) => {
    const res = await request.get('/api/mystic/appointments/mine');
    expect(res.status()).toBe(401);
  });

  test('geocode distance requires auth', async ({ request }) => {
    const res = await request.post('/api/mystic/geocode/distance', {
      data: {
        line1: '123 Main St',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
      },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe('Mystic — boundary (query validation)', () => {
  test('availability rejects invalid date', async ({ request }) => {
    const res = await request.get('/api/mystic/availability?date=not-a-date&serviceId=blowout');
    expect(res.status()).toBe(400);
  });

  test('availability returns HH:mm slot ids for a valid date', async ({ request }) => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    const date = d.toISOString().slice(0, 10);
    const res = await request.get(`/api/mystic/availability?date=${date}&serviceId=blowout`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.slots)).toBe(true);
    for (const slot of (body.slots as string[]).slice(0, 5)) {
      expect(slot).toMatch(/^\d{1,2}:\d{2}(:\d{2})?$/);
    }
  });

  test('checkout booking rejects unauthenticated requests', async ({ request }) => {
    const res = await request.post('/api/mystic/checkout/booking', { data: {} });
    expect(res.status()).toBe(401);
  });
});

test.describe('Mystic — book UX strings (web)', () => {
  test('book page omits deprecated referral-code field copy', async ({ page }) => {
    await page.goto('/book');
    await expect(page.getByText(/referral code \(optional\)/i)).toHaveCount(0);
  });
});
