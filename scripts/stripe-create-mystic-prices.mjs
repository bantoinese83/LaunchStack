#!/usr/bin/env node
/** Create Mystic Stripe prices via Stripe CLI; print ENV=price_id lines to stdout. */
import { execSync } from 'node:child_process';

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  console.error('STRIPE_SECRET_KEY required');
  process.exit(1);
}

const env = { ...process.env, STRIPE_API_KEY: secret };

function stripe(args) {
  return JSON.parse(execSync(`stripe ${args}`, { encoding: 'utf8', env }));
}

const catalog = [
  { env: 'STRIPE_PRICE_MYSTIC_GLOW', name: 'Mystic — The Glow', amount: 7000, interval: 'month' },
  { env: 'STRIPE_PRICE_MYSTIC_LUXE', name: 'Mystic — The Luxe', amount: 14000, interval: 'month' },
  { env: 'STRIPE_PRICE_MYSTIC_PACK_4', name: 'Mystic — 4 blowouts', amount: 16000 },
  { env: 'STRIPE_PRICE_MYSTIC_PACK_6', name: 'Mystic — 6 blowouts', amount: 22500 },
  { env: 'STRIPE_PRICE_MYSTIC_PACK_10', name: 'Mystic — 10 blowouts', amount: 35000 },
];

const existing = stripe('products list --limit 100');
const byName = new Map((existing.data || []).map((p) => [p.name, p.id]));

for (const item of catalog) {
  let productId = byName.get(item.name);
  if (!productId) {
    const product = stripe(`products create -d name=${JSON.stringify(item.name)}`);
    productId = product.id;
    byName.set(item.name, productId);
  }

  const priceArgs = [
    'prices create',
    `-d product=${productId}`,
    `-d unit_amount=${item.amount}`,
    '-d currency=usd',
  ];
  if (item.interval) priceArgs.push(`-d recurring[interval]=${item.interval}`);

  const price = stripe(priceArgs.join(' '));
  console.log(`${item.env}=${price.id}`);
}
