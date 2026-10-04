import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withSentryConfig } from '@sentry/nextjs/config';
import { validateEnv } from './../../packages/config/env.ts';
import { mergeEnvFromMonorepo } from './../../packages/config/merge-env.mjs';

const appDir = path.dirname(fileURLToPath(import.meta.url));
mergeEnvFromMonorepo(appDir);
validateEnv(process.env);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Statically typed `<Link href>` / `router.push` — validated by `next typegen`
  // (run automatically by the `typecheck` script).
  typedRoutes: true,
  transpilePackages: [
    '@template/ui',
    '@template/types',
    '@template/api',
    '@template/auth',
    '@template/validation',
  ],
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: "default-src 'self'; frame-ancestors 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
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
  project: 'admin',
});
