# Mystic Hair Co. — Product Brief (Luke)

**Client:** Luke / Mystic Hair Co. (@mystichair21)  
**Business:** Mobile house-call hair services (Chicago / River North)  
**Replacing:** Vagaro (packages + memberships + payments in one place)  
**Goal:** Own branded booking app — simple for Luke, premium for clients, path to ~30–40 recurring clients and leaving Drybar full-time.

---

## Brand & design

| Element | Direction                                                                        |
| ------- | -------------------------------------------------------------------------------- |
| Vibe    | Mid-century modern + clean boho; VW-bus quirky warmth                            |
| Palette | Sage green, cream/off-white, muted gold, soft plum (from logo & flyers)          |
| UX      | **Simple, minimal** — fewer toggles than Vagaro; Instagram bio → one link → book |
| Assets  | Logo (`Sep 3 at 09_21-1.jpeg`), package flyer, membership flyer                  |

---

## Services & pricing (house call)

| Service   | Price | Duration (default) |
| --------- | ----- | ------------------ |
| Blowout   | $45   | 60 min             |
| Haircut   | $65   | 60 min             |
| Updo      | $90   | 60 min             |
| Dry style | $35   | 30 min             |

**Not in-app (for now):** Color (logistics); optional future add-ons (bang trim, etc.).

### Blowout packages (prepaid credits, **expire 6 months**)

| Package     | Price | Per blowout | Savings   |
| ----------- | ----- | ----------- | --------- |
| 4 blowouts  | $160  | $40         | Save $20  |
| 6 blowouts  | $225  | $37.50      | Save $45  |
| 10 blowouts | $350  | $35         | Save $100 |

Additional services beyond package credits: regular menu pricing.

### Memberships (monthly subscription, **house call only**)

| Tier     | Price/mo | Included                            | Extra blowout |
| -------- | -------- | ----------------------------------- | ------------- |
| **Glow** | $70      | 2 blowouts/mo (any timing in month) | $30           |
| **Luxe** | $140     | 4 blowouts/mo                       | $30           |

**Member perks:** No evening/distance surcharges; flexible last-minute time shifts when Luke can accommodate.  
**One-off clients:** Surcharges apply (see rules below).

---

## Booking & scheduling rules

- **Buffer:** 30 minutes between appointments (standard); **45 minutes in winter** (admin toggle — Uber/transit).
- **Minimum slot:** 60 min except dry style (30 min incl. setup/teardown).
- **Late client:** >15 min late may forfeit slot (policy TBD in copy).
- **Luke adjusts:** Client self-books; Luke can move appointments and contact client manually.

### Surcharges (auto-applied at checkout — **not** for members or package holders)

- **After 8:00 PM:** e.g. $25 (confirm exact amount with Luke).
- **Distance:** After ~5 miles, per-mile fee (e.g. $5–10/mi — confirm).

---

## House-call policies (client must acknowledge)

1. **Clean hair required** for blowout/haircut — Luke does not wash unless client has a **kitchen sink with spray hose**.
2. **Seating:** No high-back chairs — client sits backward on chair if needed.
3. **Power:** Luke brings extension cord; outlet preferred but not required.

Display at booking + in confirmation email/SMS.

---

## Feature phases

### Phase 1 — MVP (launch target: ~4 weeks)

Priority order from discovery call:

1. **Stripe** — memberships, packages, one-off services, tips, deposits.
2. **Public booking** — shareable link (`book.mystichair.co` or similar), service picker, address, datetime from Luke’s availability.
3. **Admin** — calendar, appointments, client list, membership/package status, block time (out of town).
4. **Client accounts** — self-signup; phone, email, birthday.
5. **Booking extras** — up to ~4 inspo photos; “referred by?” (name); policy checkbox.
6. **Email** — confirmations, reminders (SMS optional if Twilio budget allows).
7. **Marketing** — simple landing + book CTA; basic SEO (Chicago mobile blowout keywords).

### Phase 2 — Operations & retention

- Email + **SMS blasts** (promos, out-of-town notice).
- Per-client **messaging** / async chat (not AI support — human Luke).
- **“Luke is on the way”** + optional location share (Domino’s-style).
- **Door timer** — 15 min countdown; deposit capture if no-show (Stripe).
- **Referral program** — track referrers; reward after N referrals (Luke defines reward).
- **Appointment tags** — silent appointment, open to chat, dietary/other notes.
- **Analytics** — bookings, revenue, link clicks, service mix (what Vagaro lacks).

### Phase 3 — Growth & commerce

- **Shop / pre-orders** — hair products; countdown to launch (~May timeline from call).
- Instagram API (post finished looks) — long lead on Meta approval.
- Deeper SEO / content pages.

---

## Technical recommendation

| Layer    | Choice                                                                                 | Why                                                          |
| -------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| App      | **Next.js** (App Router) on Vercel                                                     | Fast booking web app + admin; great SEO                      |
| Payments | **Stripe** Billing (memberships) + Checkout/Payment Intents (packages, services, tips) | Luke already accepts ~2.6% effective loss on $70 memberships |
| DB       | **Postgres** (Neon/Supabase)                                                           | Clients, appointments, credits, referrals                    |
| Auth     | **Clerk** or **Stack Auth**                                                            | Client login + Luke admin role                               |
| Files    | **Vercel Blob**                                                                        | Inspo photos                                                 |
| Email    | **Resend**                                                                             | Transactional + blast (phase 2)                              |
| SMS      | **Twilio**                                                                             | Blasts + “on the way” (phase 2)                              |

**Note:** Native iOS/Android can be **PWA first** (add to home screen) to ship faster; wrap in Capacitor/React Native later if Luke wants App Store presence under your Apple developer account.

---

## Admin CMS (Luke-facing)

- View/edit calendar and appointments.
- Run promotions (e.g. holiday % off).
- Toggle winter buffer mode.
- Manage blocked dates + blast templates.
- See membership/package balances per client.
- Referral credits (manual approve or auto rules).

Luke wants **concierge support** ($100–150/mo hosting/maintenance vs $45 Vagaro) — you operate infra; he uses simple admin.

---

## Open questions for Luke

1. Exact **after-hours** and **per-mile** surcharge amounts.
2. **Deposit** amount for bookings and no-show/door-timer policy.
3. **Service area** map or max radius default.
4. **Referral reward** (free blowout after 5 referrals mentioned in call — confirm).
5. App name in stores: “Mystic Hair Co.” vs custom.
6. Domain for booking link.

---

## Success metrics

- ~15 → **30–35** active clients (members + packages + repeat).
- Reduce booking friction (no constant texting during Drybar shifts).
- Single dashboard: who’s booked, who’s paid, who has credits left.

---

## Source files in `/docs`

- `luke.txt` — service price list (email follow-up)
- `luke-app.m4a` / `luke-app.txt` — ~63 min discovery call (Whisper transcript)
- Package & membership PNGs, logo JPEG
