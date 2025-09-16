import nextPlugin from '@next/eslint-plugin-next';
import { defineConfig } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

import { ifAnyDep } from '../utils.js';

/**
 * React ESLint configuration. Includes React, React Hooks, and JSX accessibility rules.
 *
 * - https://github.com/jsx-eslint/eslint-plugin-react
 * - https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
 * - https://github.com/jsx-eslint/eslint-plugin-jsx-a11y
 */
export default defineConfig([
  {
    name: 'codfish/react',

    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],

    ...react.configs.flat.recommended,
    ...jsxA11y.flatConfigs.recommended,

    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },

  // React Hooks configuration
  reactHooks.configs['recommended-latest'],

  // Next.js configuration (dynamic)
  ifAnyDep(
    'next',
    {
      ...nextPlugin.flatConfig.recommended,
      ...nextPlugin.flatConfig.coreWebVitals,

      name: 'codfish/next',
    },
    {},
  ),

  {
    rules: {
      'react-hooks/exhaustive-deps': 'off',
    },
  },
]);
