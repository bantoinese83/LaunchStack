import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withSentryConfig } from '@sentry/nextjs/config';
import { validateEnv } from './../../packages/config/env.ts';
import { mergeEnvFromMonorepo } from './../../packages/config/merge-env.mjs';

const appDir = path.dirname(fileURLToPath(import.meta.url));

// Monorepo: Next loads `apps/web/.env*` by default; also pull repo-root env files.
mergeEnvFromMonorepo(appDir);

// Validate the environment at build / server-start time. Non-throwing by
// design — see packages/config/env.ts: missing NEXT_PUBLIC_* values are
// flagged [BUILD-CRITICAL] (they are inlined into the client bundle) while
// missing server secrets fail closed at request time instead of at boot.
validateEnv(process.env);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Statically typed `<Link href>` / `router.push` — validated by `next typegen`
  // (run automatically by the `typecheck` script). Catches broken routes at
  // compile time instead of at click time.
  typedRoutes: true,
  transpilePackages: [
    '@template/ui',
    '@template/types',
    '@template/validation',
    '@template/api',
    '@template/auth',
    '@template/email',
    '@template/analytics',
    '@template/feature-flags',
    '@template/kv',
  ],
  output: 'standalone',
  async headers() {
    // Content-Security-Policy: practical default for a Next.js SaaS app.
    // - 'unsafe-inline' is required for Next.js inline styles & scripts.
    // - Adjust connect-src to add any third-party API hostnames you call client-side.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          // X-XSS-Protection removed: deprecated and a no-op in modern browsers;
          // replaced by the CSP header above.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: 'launchstack',
  project: 'web',
});
