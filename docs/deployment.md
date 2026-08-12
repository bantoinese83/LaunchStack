# Deployment & Release Guide (`LaunchStack`)

## CI/CD Automation (GitHub Actions)

We use GitHub Actions to automate the testing, linting, and database verification for this template.

- **`main.yml`**: Triggers on PRs and pushes to `main`. It parallelizes `lint`, `format:check`, `typecheck`, `test` (Vitest), and `build`.
- **`supabase.yml`**: Triggers on PRs modifying the database. It spins up a local Supabase instance, runs all migrations, and verifies that the TypeScript types accurately match the resulting schema.

## Web Apps (`apps/web` & `apps/admin`) — Docker Deployment

Both web applications are configured for Next.js `output: 'standalone'` builds. This drastically reduces the final container size by only copying over transpiled files and traces.

To deploy via Docker (e.g. AWS ECS, Google Cloud Run, or Kubernetes):

```bash
# Build Customer App
docker build -t launchstack-web -f apps/web/Dockerfile .
docker run -p 3000:3000 launchstack-web

# Build Admin Portal
docker build -t launchstack-admin -f apps/admin/Dockerfile .
docker run -p 3002:3002 launchstack-admin
```

> **Note**: A `.dockerignore` is included at the root to prevent large node_modules and turbo caches from blowing up the Docker build context.

## Web Apps (`apps/web` & `apps/admin`) — Vercel Deployment

If you prefer Vercel over Docker:

1. Connect the monorepo to Vercel.
2. Set Root Directory for customer app to `apps/web`.
3. Set Root Directory for admin portal to `apps/admin`.
4. Configure environment variables in the Vercel Dashboard. Required for billing:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET` (must be the real endpoint signing secret in production — see [Security](./security.md))
   - Optional for rate limiting: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

## Mobile App (`apps/mobile`) — Expo EAS Deployment

1. Install EAS CLI: `npm i -g eas-cli`
2. Authenticate: `eas login`
3. Configure project: `eas build:configure`
4. Trigger iOS Build: `eas build --platform ios --profile production`
5. Trigger Android Build: `eas build --platform android --profile production`
6. Submit to App Stores: `eas submit --platform all`

## Supabase PostgreSQL & Edge Functions

1. Link project: `supabase link --project-ref <your-project-ref>`
2. Push migrations: `supabase db push`
3. Deploy Edge Functions: `supabase functions deploy`
