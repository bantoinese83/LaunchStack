import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Merge monorepo-root `.env*` into `process.env` without overriding values Next
 * (or the shell) already set. `.env.build` is last so it only fills gaps for
 * hermetic `pnpm build` / `pnpm quality` when no local `.env` exists.
 */
export function mergeEnvFromMonorepo(appDir) {
  const repoRoot = path.join(appDir, '../..');
  const names = [
    '.env.development.local',
    '.env.local',
    '.env.development',
    '.env',
    '.env.build',
  ];

  for (const name of names) {
    const file = path.join(repoRoot, name);
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      if (!key || process.env[key] !== undefined) continue;
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}
