import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.spec.js'],
    exclude: ['node_modules/**', 'dist/**'],
    testTimeout: 30000, // Some ESLint tests may take longer
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/**', 'dist/**', 'tests/**', '*.config.js', 'prettier.js', 'commitlint.js'],
    },
  },
});
