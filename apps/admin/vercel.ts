import type { VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  framework: 'nextjs',
  installCommand: 'cd ../.. && pnpm install --frozen-lockfile',
  buildCommand: 'cd ../.. && pnpm --filter @template/admin build',
};
