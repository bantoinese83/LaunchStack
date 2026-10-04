import { defineConfig } from 'vitest/config';

// Vitest 4 monorepo setup. The legacy `vitest.workspace.ts` / defineWorkspace
// API was removed in Vitest 4 in favour of `test.projects` in the root config.
//
// Each package's own vitest.config.mts is a project (currently @template/api,
// @template/auth, @template/validation and @template/web). This file is `.mts`
// (not `.ts`) so the ESM syntax below never triggers Vite's "ESM syntax in a
// file loaded as CommonJS" warning under the CommonJS root package.json.
export default defineConfig({
  test: {
    projects: ['packages/*/vitest.config.mts', 'apps/web/vitest.config.mts'],
  },
});