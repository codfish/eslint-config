import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-plugin-prettier/recommended';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import ymlPlugin from 'eslint-plugin-yml';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import prettierBuiltInConfig from './prettier.js';
import configFilesConfig from './rules/config-files.js';
import jestConfig from './rules/jest.js';
import reactConfig from './rules/react.js';
import vitestConfig from './rules/vitest.js';
import { hasLocalConfig, ifAnyDep } from './utils.js';

const useBuiltinPrettierConfig = !hasLocalConfig('prettier');

/**
 * Modern ESLint configuration with dynamic feature detection
 * Supports TypeScript, React, Jest, Vitest, Prettier, YAML, and Next.js
 */
export default defineConfig([
  // Base JavaScript configuration
  js.configs.recommended,

  tseslint.configs.recommended,

  // Base configuration for all files
  {
    name: 'codfish/base',

    plugins: {
      'simple-import-sort': simpleImportSortPlugin,
    },

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },

    rules: {
      // Custom Grouping: https://github.com/lydell/eslint-plugin-simple-import-sort#custom-grouping
      // Examples: https://github.com/lydell/eslint-plugin-simple-import-sort/blob/main/examples/.eslintrc.js
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. Node.js builtins prefixed with `node:` or node_modules
            // Exclude relative imports using aliases like `@/` or `@{src|test|tests}` (common ts config paths).
            ['^node:', '^\\u0000', '^(\\w|@(?!src|tests?\\/)\\w)'],
            // All local imports:
            // - Absolute imports and other imports like `@/foo`.
            // - Anything not matched in another group.
            // - Anything that starts with a dot.
            ['^', '^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      // 2. Encouraging `lodash-es` imports per file
      // lodash imports should use `lodash-es` package and should be imported per file.
      //    E.G: `import get from 'lodash-es/get'`
      // More details in https://stackoverflow.com/questions/35250500/correct-way-to-import-lodash#answer-35251059
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lodash',
              message: "Please use lodash-es direct import E.G: `import get from 'lodash-es/get'`",
            },
            {
              name: 'lodash-es',
              message: "Please use lodash-es direct import E.G: `import get from 'lodash-es/get'`",
            },
          ],
          patterns: [
            {
              group: ['lodash/*'],
              message: "Please use lodash-es direct import E.G: `import get from 'lodash-es/get'`",
            },
          ],
        },
      ],
    },
  },

  // Custom ignores
  {
    name: 'codfish/ignores',

    ignores: [
      '!.github',
      '!.vitepress',
      '.next',
      'coverage',
      '.vercel',
      '**/logs/',
      'bin/*',
      '**/dist/',
      '**/dist-ssr/',
      '**/cache/',
      '**/coverage/',
      'cypress/screenshots/',
      'cypress/videos/',
      'storybook-static',
      '.nuxt',
      '.svelte-kit',
      '.docusaurus',
      '.astro',
      '.output',
      '**/out/',
      '.vite',
      '.parcel-cache',
      '.webpack',
      '.turbo',
      '.nyc_output',
      'playwright-report',
      'cypress/downloads/',
      'cypress/reports/',
      '.serverless',
      '.netlify',
      '.wrangler',
      '.firebase',
      'android',
      'ios',
      '.expo',
      '**/tmp/',
      '**/temp/',
      '.tmp',
      '.eslintcache',
      '*.tsbuildinfo',
    ],
  },

  // Configuration files (eslint, prettier, etc.)
  configFilesConfig,

  // YML files
  ymlPlugin.configs['flat/standard'],
  ymlPlugin.configs['flat/prettier'], // handles conflicting rules with the yml plugin

  {
    name: 'codfish/github-yml-overrides',

    files: ['.github/**/*.yml', '.github/**/*.yaml'],

    rules: {
      'yml/no-empty-mapping-value': 'off', // somewhat common in github workflows
    },
  },

  // React configuration (dynamic)
  ifAnyDep('react', reactConfig, []),

  // Jest OR Vitest configuration (dynamic)
  ifAnyDep('jest', jestConfig, []),

  // Vitest configuration (dynamic)
  ifAnyDep('vitest', vitestConfig, []),

  // Prettier plugin is responsible for running prettier as an ESLint
  // rule and turning off ESLint rules that might conflict.
  // IMPORTANT: KEEP THIS LAST TO OVERRIDE ESLINT!
  prettier,

  {
    rules: {
      // Reset prettier rule passing in codfish's prettier config.
      // IMPORTANT: KEEP THIS LAST TO OVERRIDE PRETTIER PLUGIN!
      'prettier/prettier': useBuiltinPrettierConfig ? ['error', prettierBuiltInConfig] : 'error',
    },
  },
]);
