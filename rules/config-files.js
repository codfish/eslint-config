import { defineConfig } from 'eslint/config';

/**
 * Configuration files ESLint rules
 * Allows importing dev dependencies in configuration files
 */
export default defineConfig({
  name: 'codfish/config-files',

  files: [
    '*.config.{js,ts}',
    '.eslintrc.{js,ts}',
    '.prettierrc.{js,ts}',
    '.commitlintrc.{js,ts}',
    '.lintstagedrc.{js,ts}',
  ],

  rules: {
    'import/no-extraneous-dependencies': 'off',
  },
});
