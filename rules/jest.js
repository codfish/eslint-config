import { defineConfig } from 'eslint/config';
import jest from 'eslint-plugin-jest';

/**
 * Jest ESLint configuration for flat config format
 * Includes Jest-specific rules and globals for test files
 */
export default defineConfig([
  {
    name: 'codfish/jest',

    files: [
      '**/__tests__/**/*.{js,ts,jsx,tsx}',
      '**/*.{test,spec}.{js,ts,jsx,tsx}',
      '**/jest.config.{js,ts}',
      '**/jest.setup.{js,ts}',
      '**/setupTests.{js,ts}',
      '**/testUtils.{js,ts}',
      'tests/**/*.{js,ts,jsx,tsx}',
    ],

    ...jest.configs['flat/recommended'],
  },
]);
