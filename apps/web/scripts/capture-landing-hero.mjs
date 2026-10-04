import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const out = path.join(root, 'docs/images/landing-hero.png');
const url = process.env.LANDING_URL ?? 'http://localhost:3000';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => {
  window.localStorage.setItem(
    'launchstack-consent',
    JSON.stringify({ necessary: true, analytics: false, marketing: false })
  );
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(`Wrote ${out}`);
