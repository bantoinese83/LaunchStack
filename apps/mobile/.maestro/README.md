# Mystic mobile — Maestro regression matrix

| Case type  | Flow file           | What it checks                       |
| ---------- | ------------------- | ------------------------------------ |
| Happy path | `mystic-smoke.yaml` | App launches, Book tab visible       |
| Happy path | `mystic-tabs.yaml`  | Client tabs render (Book, Visits, …) |
| Negative   | Manual / API tests  | Use web `mystic-regression.spec.ts`  |

## Prerequisites

- iOS Simulator or Android emulator with a **dev build** (`co.mystichair.app`) or Expo dev client
- Web API running (`pnpm dev:web`) and `EXPO_PUBLIC_APP_URL` pointing at it

## Run

```bash
# From repo root (Maestro CLI installed)
maestro test apps/mobile/.maestro/mystic-smoke.yaml
maestro test apps/mobile/.maestro/
```

For **Expo Go**, change `appId` in each flow to `host.exp.Exponent` and open the project URL before running.
