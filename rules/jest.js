import { defineConfig } from 'eslint/config';
import jest from 'eslint-plugin-jest';
import testingLibrary from 'eslint-plugin-testing-library';

import { ifAnyDep } from '../utils.js';

/**
 * Jest ESLint configuration for flat config format
 * Includes Jest-specific rules, globals, and Testing Library rules for test files
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

    ...ifAnyDep('react-testing-library', testingLibrary.configs['flat/react'], {}),
    ...ifAnyDep('vue-testing-library', testingLibrary.configs['flat/vue'], {}),

    rules: {
      'no-console': 'off',
    },
  },
]);
