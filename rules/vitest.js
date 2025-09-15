import vitest from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

/**
 * Vitest ESLint configuration for flat config format
 * Includes Vitest-specific rules and globals for test files
 */
export default defineConfig([
  {
    files: [
      '**/*.{spec,test}.{js,ts,jsx,tsx}',
      '**/tests/**/*.{js,ts,jsx,tsx}',
      '**/__mocks__/**/*.{js,ts,jsx,tsx}',
      '**/__tests__/**/*.{js,ts,jsx,tsx}',
    ],

    ...vitest.configs.recommended,

    name: 'codfish/vitest',

    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
        ...globals.node,
      },
    },

    rules: {
      'no-console': 'off',
      'tailwindcss/no-custom-classname': 'off',
    },
  },
]);
