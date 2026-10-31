# Phase 2.5 & Phase 3 — apply checklist

Run after `20261031120000_mystic_hair_operations.sql`.

## 1. Migration

```bash
pnpm db:reset   # or supabase db push
pnpm db:types
```

New file: `supabase/migrations/20261031140000_mystic_phase25_phase3.sql`

Adds: blocked dates, client credits, inspo photos, preorders, referral codes, `payment_captured` on appointments.

## 2. Supabase Storage

Create bucket **`mystic-inspo`** (public read) for client inspo uploads on `/visits`.

## 3. Stripe — booking deposits

Booking checkout uses **manual capture** on the PaymentIntent:

- Luke taps **Complete** in studio → full service + tip captured (`POST /api/mystic/appointments/complete`).
- **No-show** → captures `deposit_cents` from studio settings only.

Ensure webhook `checkout.session.completed` still confirms appointments.

## 4. Stripe — credits

On membership/package checkout webhooks, `mystic_client_credits` rows are created automatically.

## 5. Studio (Luke)

| Path                | Feature                                |
| ------------------- | -------------------------------------- |
| `/studio/settings`  | Block out-of-town dates                |
| `/studio/clients`   | Client list + credits + referral codes |
| `/studio`           | **Complete** visit (capture payment)   |
| `/studio/instagram` | Meta API placeholder                   |

## 6. Client

| Path                      | Feature                        |
| ------------------------- | ------------------------------ |
| `/account`                | Referral code + credit summary |
| `/book`                   | Referral code field            |
| `/visits`                 | Inspo photo upload (max 4)     |
| `/shop`                   | Product pre-orders             |
| `/chicago-mobile-blowout` | SEO landing                    |

## 7. Instagram API

Not wired — use manual posting until Meta app review. Studio page documents next steps.
