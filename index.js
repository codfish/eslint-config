import js from '@eslint/js';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import html from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';
import { defineConfig } from 'eslint/config';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import ymlPlugin from 'eslint-plugin-yml';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import prettierBuiltInConfig from './prettier.js';
import configFilesConfig from './rules/config-files.js';
import reactConfig from './rules/react.js';
import testConfig from './rules/tests.js';
import { hasLocalConfig, ifAnyDep } from './utils.js';

const useBuiltinPrettierConfig = !hasLocalConfig('prettier');

/**
 * Modern ESLint configuration with dynamic feature detection.
 * Supports TypeScript, React, Vitest, Prettier, YAML, and more.
 *
 * React ESLint configuration. Includes React, React Hooks, and JSX accessibility rules.
 *   - https://github.com/jsx-eslint/eslint-plugin-react
 *   - https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
 *   - https://github.com/jsx-eslint/eslint-plugin-jsx-a11y
 */
export default defineConfig([
  // Base opinionated rules
  {
    name: 'codfish/base',

    files: ['**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}'],

    extends: [js.configs.recommended, tseslint.configs.recommended],

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
      // Error handling rules to enforce using the Error object
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',

      // Asynchronous functions that don’t use await might not need to be asynchronous functions
      // Usually result of refactoring, leads to misunderstanding/misusage
      'require-await': 'error',

      // Disallow console statements in regular code (only allowed in test files)
      'no-console': 'error',

      // Consolidate your imports
      'no-duplicate-imports': ['error', { includeExports: false }],

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
      'sort-imports': 'off',

      // Allows destructuring of rest properties even if they are unused
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['interface', 'typeAlias'],
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]', // prevent prefixing interfaces and type alias declarations with "I"
            match: false,
          },
        },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          // If you need to use a ts comment, make sure you have a description.
          'ts-ignore': 'allow-with-description',
          'ts-expect-error': 'allow-with-description',
          'ts-nocheck': 'allow-with-description',
        },
      ],

      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            'React.FC': {
              message: 'Useless and has some drawbacks, see https://github.com/facebook/create-react-app/pull/8177',
            },
            'React.FunctionComponent': {
              message: 'Useless and has some drawbacks, see https://github.com/facebook/create-react-app/pull/8177',
            },
          },
        },
      ],

      // 1. Encouraging `lodash-es` imports per file
      // lodash imports should use `lodash-es` package and should be imported per file.
      //    E.G: `import get from "lodash-es/get"`
      // More details in https://stackoverflow.com/questions/35250500/correct-way-to-import-lodash#answer-35251059
      // 2. Prevent relative imports - use path aliases instead
      // Use `@/` for src imports and `@tests/` for test imports
      // 3. Prevent vitest globals imports - these are available globally
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lodash',
              message: 'Please use lodash-es direct import E.G: `import get from "lodash-es/get"`',
            },
            {
              name: 'lodash-es',
              message: 'Please use lodash-es direct import E.G: `import get from "lodash-es/get"`',
            },
            {
              name: 'jest',
              importNames: ['describe', 'expect', 'test', 'it', 'jest'],
              message:
                'These jest globals (describe, expect, test, it, jest) are available globally and should not be imported. Remove this import statement.',
            },
            {
              name: 'vitest',
              importNames: ['describe', 'expect', 'test', 'it', 'vi'],
              message:
                'These vitest globals (describe, expect, test, it, vi) are available globally and should not be imported. Remove this import statement.',
            },
          ],
          patterns: [
            {
              group: ['lodash/*'],
              message: 'Please use lodash-es direct import E.G: `import get from "lodash-es/get"`',
            },
            {
              // Prevent relative imports going back 1+ directories. Use @/ or @tests/ aliases instead.
              // Ensures consistent and cleaner import paths, and avoids confusing import hell with deeply nested files.
              group: ['../*', '../../*', '../../../*', '../../../../*'],
              message:
                'Relative imports going back 1+ directories are not allowed. Use path aliases: @/ for src/*, @tests/ for tests/* imports. For example, instead of `import x from "../components/*"`, use `import x from "@/components/*"`',
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
      '**/.tmp',
      '.nx',
      '**/.eslintcache',
      '*.tsbuildinfo',
      'node_modules',
      '**/node_modules/',
      '**/pnpm-lock.yaml',
      '**/pnpm-lock.*.yaml',
      '.history',
      '**/.yarn',
      '**/yarn.lock',
      '**/package-lock.json',
      '**/.yarnrc.yml',
      'pacts',
      '.claude',
      '.__mf__temp',
    ],
  },

  // Configuration files (eslint, prettier, etc.)
  configFilesConfig,

  // React configuration (dynamic)
  ifAnyDep('react', reactConfig, []),

  // Jest OR Vitest configuration (dynamic)
  ifAnyDep(['jest', 'vitest'], testConfig, []),

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

  // JSON files
  {
    name: 'codfish/json',
    files: ['**/*.json'],
    ignores: ['**/tsconfig*.json', '**/package-lock.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },

  // JSONC files (JSON with Comments) - for files that allow comments
  {
    name: 'codfish/jsonc',
    files: ['**/*.jsonc'],
    plugins: { json },
    language: 'json/jsonc',
    extends: ['json/recommended'],
  },

  // JSON5 files - for TypeScript configs (supports comments AND trailing commas)
  {
    name: 'codfish/json5',
    files: ['**/tsconfig*.json', '**/*.json5'],
    plugins: { json },
    language: 'json/json5',
    extends: ['json/recommended'],
  },

  // Markdown files
  {
    name: 'codfish/markdown',
    files: ['**/*.md'],
    plugins: { markdown },
    extends: ['markdown/recommended'],
    rules: {
      // Allow GitHub-style alerts and checkbox syntax (task lists)
      'markdown/no-missing-label-refs': [
        'error',
        { allowLabels: ['!NOTE', '!WARNING', '!IMPORTANT', '!TIP', '', 'x', 'X'] },
      ],
    },
  },

  // HTML files
  {
    name: 'codfish/html',
    files: ['**/*.html'],
    plugins: { html },
    languageOptions: { parser: htmlParser },
  },

  // Prettier plugin is responsible for running prettier as an ESLint
  // rule and turning off ESLint rules that might conflict.
  // IMPORTANT: KEEP THIS LAST TO OVERRIDE ESLINT!
  {
    files: ['**/*.{js,ts,jsx,tsx,md,yml,yaml,html,json,jsonc,json5}'],

    plugins: {
      prettier: prettierPlugin,
    },

    rules: {
      // Reset prettier rule passing in custom prettier config.
      'prettier/prettier': useBuiltinPrettierConfig ? ['error', prettierBuiltInConfig] : 'error',
    },
  },
]);
