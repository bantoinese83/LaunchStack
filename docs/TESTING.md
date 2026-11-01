# Testing & QA

## Quick commands

| Command                | What it runs                                                 |
| ---------------------- | ------------------------------------------------------------ |
| `pnpm test`            | Unit/integration tests in all workspaces (Turbo)             |
| `pnpm test:smoke`      | Mystic + validation unit tests, then Mystic Playwright smoke |
| `pnpm test:e2e`        | Full Playwright suite (starts web dev server)                |
| `pnpm test:e2e:mystic` | Mystic regression + book-flow smoke only                     |
| `pnpm quality:full`    | format, lint, typecheck, unit tests, Mystic e2e, build       |

CI (`.github/workflows/main.yml`) runs lint, Expo doctor, typecheck, format, `pnpm test`, full Playwright, and build.

## Layers

### Shared contract (`packages/mystic`)

- **Pricing, tips, entitlements, policies, phone, availability** — Vitest in `@template/mystic`.
- **`book-flow-ui.ts`** — Single source for shared book-flow strings (web + mobile import `BOOK_FLOW_COPY`).
- **`book-flow-parity.test.ts`** — Tips, policies, entitlements, and empty-state contracts.

### Validation (`packages/validation`)

- **`mystic-booking.test.ts`** — Checkout payload schema (referred-by name, policies, tip caps).

### Web API & libs (`apps/web`)

- Route and lib tests under `src/**/*.test.ts` (Vitest).
- **`multipart-upload.test.ts`** — Avatar/inspo uploads from browser and React Native FormData.

### E2E (`apps/web/tests`)

- **`mystic-regression.spec.ts`** — API auth boundaries, availability shape, book page copy.
- **`book-flow-smoke.spec.ts`** — Book stepper, 12-hour time labels, no referral-code field.
- **`signed-in.spec.ts`** — Requires `E2E_SIGNED_IN=1` and real auth (optional in CI).

## Parity checklist (manual)

When changing book or profile UX, update **web and mobile** and run:

```bash
pnpm --filter @template/mystic test
pnpm test:e2e:mystic
```

Mobile has no Playwright suite; rely on shared `@template/mystic` contracts and device smoke.
