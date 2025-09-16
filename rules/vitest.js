import vitest from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';
import testingLibrary from 'eslint-plugin-testing-library';
import globals from 'globals';

import { ifAnyDep } from '../utils.js';

/**
 * Vitest ESLint configuration for flat config format
 * Includes Vitest-specific rules, globals, and Testing Library rules for test files
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

    ...ifAnyDep('react-testing-library', testingLibrary.configs['flat/react'], {}),
    ...ifAnyDep('vue-testing-library', testingLibrary.configs['flat/vue'], {}),

    name: 'codfish/vitest',

    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
        ...globals.node,
      },
    },

    rules: {
      'no-console': 'off',
      ...ifAnyDep('tailwindcss', { 'tailwindcss/no-custom-classname': 'off' }, {}),
    },
  },
]);
