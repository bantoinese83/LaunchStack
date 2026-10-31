# Mystic Hair Co. — Quality audit

**Scope:** Web (`apps/web`), mobile (`apps/mobile`), shared packages, CI/CD.  
**Verification run:** `pnpm quality` (format, lint, typecheck, unit tests, production build).  
**Date:** Generated as part of full-stack quality review.

---

## Executive summary

| Area                  | Rating                         | Notes                                                                    |
| --------------------- | ------------------------------ | ------------------------------------------------------------------------ |
| Navigation & routing  | **Good** (web mobile improved) | Expo Router + Next App Router; web `<sm` now has client menu             |
| UI & layout           | **Strong**                     | Road-trip design system, studio vs client shells                         |
| Interactions          | **Strong**                     | Magnetic buttons (web), NativeButton 3D (mobile)                         |
| Forms & validation    | **Strong**                     | Zod in `@template/validation`; API `safeParse` pattern                   |
| Design system         | **Strong**                     | `globals.css` + `@template/mobile-ui` tokens aligned                     |
| Accessibility         | **Moderate**                   | Focus rings, some SR text; mobile labels still sparse outside book/empty |
| Performance           | **Good**                       | Turbo cache, Next build; map `tracksViewChanges={false}` on mobile       |
| Security              | **Strong**                     | RLS, route auth, rate limits in `proxy.ts`, Stripe webhook verify        |
| Errors & logging      | **Good**                       | Sentry on routes; structured `routeErrorResponse`                        |
| Mobile responsiveness | **Good**                       | Dedicated app + responsive web; header menu added                        |
| API / integrations    | **Good**                       | Supabase, Stripe, Brevo, Twilio optional; `verify:integrations` script   |
| i18n                  | **Minimal**                    | EN default; cookie locale + login/cookie strings only                    |
| Architecture          | **Strong**                     | Monorepo, `@template/mystic` domain, thin app layers                     |
| DevOps                | **Strong**                     | GitHub Actions: lint, expo-doctor, typecheck, Playwright, build          |
| Prior UX fixes        | **Verified**                   | Avatars, service SVGs, checkout cancel, auth bleed — see §16             |
| Docs & code quality   | **Good**                       | LAUNCH.md, README; Prettier + ESLint + Husky                             |

---

## 1. Navigation & routing

### Web

- **App Router:** Marketing, auth, client (`/book`, `/visits`, `/messages`, `/account`), studio (`/studio/*`).
- **Proxy (`src/proxy.ts`):** Session refresh + API rate limiting (Upstash); not full page auth gate — pages/API enforce auth.
- **Fix applied:** `MysticHeaderMobileNav` — visits, messages, plans, shop, account on viewports `< sm` (previously only Book + Account visible).

### Mobile

- **Expo Router:** `(auth)`, `(app)/(tabs)` book · visits · plans · inbox · studio · profile.
- **Deep links:** Booking cancel `mystichair://book?canceled=1`; auth callback documented in `.env.example`.

### Tests

- Playwright: `tests/auth.spec.ts`, `signed-in.spec.ts`, `mystic-regression.spec.ts`, marketing/product specs (CI).

---

## 2. UI components & layout

- Shared primitives: `mystic-styles.ts`, `MysticClientPage`, `NativeScreenHeader`, empty states (`@template/mystic/empty-states`).
- Illustrations: SVG service marks (`MysticServiceIllustration` / `NativeServiceIllustration`); not stock JPGs in UI.
- Avatars: `MysticUserAvatar` / `NativeUserAvatar` in messages, studio ops, maps, visits.

---

## 3. Buttons, links & interactions

- Web: `MysticMagneticButton` / `MysticMagneticLink` with focus class `mystic-link-focus`.
- Mobile: `NativeButton` + `nativeBtn3d` capsule styling.
- Message threads: Enter to send (web); polling + AppState refresh (mobile).

---

## 4. Forms & input validation

- **Server:** `@template/validation` Zod schemas (e.g. `mysticClientProfileSchema`, booking payloads).
- **Client:** HTML constraints + UX copy; server is source of truth.
- **Blocked dates / studio settings:** API returns Zod issue messages via `firstZodIssueMessage`.

**Recommendation:** Add client-side Zod mirroring for book flow address step (optional; reduces round-trips).

---

## 5. Design system adherence

- Tokens documented in `apps/web/src/app/globals.css` and `packages/mobile-ui/src/theme.ts`.
- Studio uses `mysticStudioNavLink`, gold pinstripe, plum eyebrows — consistent with marketing.

---

## 6. Accessibility

| Check                | Web                                      | Mobile                                |
| -------------------- | ---------------------------------------- | ------------------------------------- |
| Focus visible        | `mystic-link-focus`                      | OS defaults                           |
| Alt / decorative     | Logo alt, `aria-hidden` on illustrations | Partial                               |
| Live regions         | Door timer, status badges                | Door timer banner                     |
| Keyboard             | Mobile nav Escape closes menu            | —                                     |
| Screen reader labels | Thread labels, map headings              | Book service rows labeled (audit fix) |

**Gaps:** Expand `accessibilityLabel` on mobile studio ops, membership, shop tabs.

---

## 7. Performance

- Turborepo caching; Next static where possible.
- Maps: batch geocode; fit bounds; mobile custom markers `tracksViewChanges={false}`.
- Images: Next `Image` for avatars; remote Supabase patterns in `next.config.mjs`.

**Recommendation:** Lighthouse on `/book` and `/` in preview deploy; track LCP on marketing hero.

---

## 8. Security & data handling

- Supabase RLS migrations in `supabase/migrations/`.
- API: `requireAuthenticatedUser`, studio role checks on mystic routes.
- Secrets: `.env.example` documents required keys; no secrets in repo.
- Stripe webhook signature verification; idempotency on booking checkout.
- Privacy: export/delete/consent routes.
- Rate limits on `/api/*` via proxy.

---

## 9. Error handling & logging

- `routeErrorResponse` → console + Sentry when `SENTRY_DSN` set.
- User-facing: toast/inline copy on client; `MysticEmptyState` for empty API results.
- Mobile: config banner when `EXPO_PUBLIC_APP_URL` missing.

---

## 10. Mobile responsiveness (web)

- Client header: desktop inline nav; mobile menu + Book CTA.
- Book flow: responsive grids for time chips.
- Studio: stacked ops cards on narrow viewports.

---

## 11. Integration & API connectivity

- Mobile → web API via `EXPO_PUBLIC_APP_URL` + Bearer from Supabase session.
- Script: `pnpm verify:integrations` for env smoke checks.
- **Requirement:** Device testing needs LAN IP for app URL, not `localhost`.

---

## 12. Internationalization

- `I18nProvider` + cookie `locale`; dictionaries EN (extensible).
- Not product-critical for Chicago v1; no mobile i18n.

---

## 13. State management & architecture

- React local state + hooks; no global Redux.
- Domain logic in `@template/mystic`; API services in `@template/api`.
- `useDeferredEffect` avoids sync setState-in-effect lint issues.

---

## 14. Deployment & DevOps

- **CI (`.github/workflows/main.yml`):** lint → expo-doctor → typecheck → format → vitest → Playwright → build.
- **Cron:** door timer workflow.
- **Supabase:** separate workflow for migrations.
- **Expo Doctor:** `pnpm check:expo` — **21/21 checks** after SDK 57 alignment (see mobile `package.json`, root `pnpm.overrides`, `babel.config.js`).

---

## 15. Verification commands

```bash
pnpm quality              # Full gate (local)
pnpm test:e2e             # Playwright (web, needs env)
pnpm check:expo           # Mobile doctor
pnpm --filter @template/mystic test
pnpm verify:integrations  # Env wiring
```

Maestro flows: `apps/mobile/.maestro/README.md`.

---

## 16. Previous fixes verified

| Item                                  | Status                                  |
| ------------------------------------- | --------------------------------------- |
| Web/mobile book service illustrations | ✅ SVG / native SVG                     |
| Message & studio avatars              | ✅ + Luke portrait via `MYSTIC_STYLIST` |
| Checkout cancel / release idempotency | ✅ Web + mobile deep link               |
| Auth full-bleed / logo sizing         | ✅                                      |
| Mobile empty states & 3D buttons      | ✅                                      |
| `pnpm quality` clean                  | ✅                                      |

---

## 17. Recommended backlog (priority)

1. **P1:** Broaden mobile a11y labels (visits list, studio ops, tabs).
2. **P1:** Resolve or document expo-doctor failures for reproducible CI green.
3. **P2:** Web book flow service row `aria-pressed` (mirror mobile).
4. **P2:** E2E cover book service step + mobile Maestro book smoke.
5. **P3:** i18n for ES if market expands; PostHog funnels for book drop-off.

---

## 18. Code quality

- Prettier on all TS/TSX/CSS; lint-staged via Husky.
- TypeScript strict across packages; shared Supabase types generated.
- Unit tests: mystic pricing/visits, route-auth, stripe webhook, validation helpers, stylist portrait URL (added in audit).

---

_Maintainers: re-run this audit after major features; update §16 when closing regression items._
