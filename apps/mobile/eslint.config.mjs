import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['.expo/**', 'node_modules/**', 'dist/**'] },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);