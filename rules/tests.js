import vitest from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';
import jest from 'eslint-plugin-jest';
import testingLibrary from 'eslint-plugin-testing-library';
import globals from 'globals';

import { ifAnyDep } from '../utils.js';

/**
 * Jest ESLint configuration for flat config format
 * Includes Jest-specific rules, globals, and Testing Library rules for test files
 */
export default defineConfig({
  name: 'codfish/tests',

  files: [
    '**/*.{spec,test}.{js,ts,jsx,tsx}',
    '**/tests/**/*.{js,ts,jsx,tsx}',
    '**/__mocks__/**/*.{js,ts,jsx,tsx}',
    '**/__tests__/**/*.{js,ts,jsx,tsx}',
    '**/jest.config.{js,ts}',
    '**/jest.setup.{js,ts}',
    '**/vitest.config.{js,ts}',
    '**/vitest.setup.{js,ts}',
    '**/setupTests.{js,ts}',
    '**/testUtils.{js,ts}',
    'tests/**/*.{js,ts,jsx,tsx}',
  ],

  extends: [
    ifAnyDep('jest', jest.configs['flat/recommended'], false),
    ifAnyDep('vitest', vitest.configs.recommended, false),
    ifAnyDep('react-testing-library', testingLibrary.configs['flat/react'], false),
    ifAnyDep('vue-testing-library', testingLibrary.configs['flat/vue'], false),
  ].filter(Boolean),

  languageOptions: {
    globals: {
      ...globals.node,
      ...ifAnyDep('jest', globals.jest, {}),
      ...ifAnyDep('vitest', globals.vitest, {}),
    },
  },

  rules: {
    'no-console': 'off',
  },
});
