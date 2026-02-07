import nextPlugin from '@next/eslint-plugin-next';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import { defineConfig } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
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

    files: ['**/*.jsx', '**/*.tsx', '**/*.mjsx', '**/*.mtsx'],

    extends: [
      react.configs.flat.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.recommended,
      jsxA11y.flatConfigs.recommended,
      ifAnyDep('@tanstack/react-query', tanstackQuery.configs['flat/recommended']),
      ifAnyDep('next', nextPlugin.configs.recommended),
      ifAnyDep('next', nextPlugin.configs['core-web-vitals']),
    ].filter(Boolean),

    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      // React 17+ uses automatic JSX runtime, no need to import React
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      // TypeScript provides type checking, no need for PropTypes
      'react/prop-types': 'off',

      // this rule is too noisey and doesn't account for certain valid use cases
      'react-hooks/exhaustive-deps': 'off',

      // sometimes autoFocus is needed for better UX. @todo - revisit later?
      'jsx-a11y/no-autofocus': 'off',

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      ...ifAnyDep('@tanstack/react-query', { '@tanstack/query/exhaustive-deps': 'error' }, {}),

      ...ifAnyDep(
        'next',
        {
          // annoying cause this is common in Next.js, i.e. generateMetadata()
          'react-refresh/only-export-components': ['off'],
        },
        {},
      ),
    },
  },

  {
    name: 'codfish/react-next-config',
    files: ['next.config.js', 'next.config.ts'],
    rules: {
      'require-await': 'off',
    },
  },
]);
