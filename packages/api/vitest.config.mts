import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // Exclude compiled output — tests should only run against source files.
    // Previously, vitest was discovering and running tests in both src/ and dist/,
    // producing duplicate results (e.g. "✓ src/... (2)" AND "✓ dist/... (2)").
    exclude: ['**/dist/**', '**/node_modules/**'],
  },
});

