# @codfish/eslint-config

> Modern ESLint configuration with TypeScript, React/Next.js, YAML, Testing Library, and testing framework support using
> ESLint v9+ flat config format.

[![version](https://img.shields.io/npm/v/@codfish/eslint-config.svg)](http://npm.im/@codfish/eslint-config)
[![downloads](https://img.shields.io/npm/dm/@codfish/eslint-config.svg)](http://npm-stat.com/charts.html?package=@codfish/eslint-config&from=2015-08-01)
[![MIT License](https://img.shields.io/npm/l/@codfish/eslint-config.svg)](http://opensource.org/licenses/MIT)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

<!-- prettier-ignore-start -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Opinionated Highlights](#opinionated-highlights)
- [Prettier Configuration](#prettier-configuration)
  - [Use in combination with prettier-plugin-tailwindcss](#use-in-combination-with-prettier-plugin-tailwindcss)
- [Example scripts](#example-scripts)
- [Commitlint Configuration](#commitlint-configuration)
- [Migration from Legacy Config](#migration-from-legacy-config)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<!-- prettier-ignore-end -->

## Features

- **Modern ESLint v9+ flat config**: Uses the new flat configuration format
- **Dynamic feature detection**: Automatically configures based on your project's dependencies
- **TypeScript support**: Full TypeScript linting with modern typescript-eslint parser and rules
- **React ecosystem**: React, React Hooks, and JSX accessibility rules when React is detected
- **Next.js support**: Automatically configures Next.js official plugin linting rules when detected
- **Test framework agnostic**: Supports Jest and Vitest with automatic detection
- **Testing Library integration**: Automatically includes Testing Library rules for test files
- **YAML/YML support**: Built-in linting for YAML configuration files
- **Prettier integration**: Built-in Prettier configuration with conflict resolution via eslint-config-prettier
- **ESM architecture**: Built with ECMAScript modules and full TypeScript typing
- **Docker support**: Optional configuration for dockerized applications
- **Blockchain/dApp support**: Optional configuration for decentralized applications

## Installation

Install the package and required peer dependencies:

```sh
npm i -D eslint@9 @codfish/eslint-config

# Optionally, you can uninstall plugins or presets you don't need to manage anymore,
# @codfish/eslint-config includes them all.
npm uninstall typescript-eslint \
  eslint-config-prettier \
  eslint-plugin-jest \
  eslint-plugin-jsx-a11y \
  eslint-plugin-prettier \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-simple-import-sort \
  eslint-plugin-testing-library \
  eslint-plugin-yml \
  @next/eslint-plugin-next \
  eslint-plugin-next \
  commitlint \
  @commitlint/cli \
  @commitlint/config-conventional
```

> [!NOTE]
>
> Optionally, you can uninstall prettier as well. If you don't have prettier installed already but you want to format
> other file types (like Markdown, JSON, CSS, etc.), you can install it as a dev dependency: `npm i -D prettier`. Then
> you can use Prettier to format your non-JS files directly. Eslint will still run Prettier as an ESLint rule.

## Usage

Create an `eslint.config.js` file in your project root:

```js
import { defineConfig } from 'eslint/config';
import codfish from '@codfish/eslint-config';

export default defineConfig(
  codfish,

  {
    rules: {
      // Relax some rules for your project
      'react/prop-types': 'off',
      'import/prefer-default-export': 'off',
      '@typescript-eslint/explicit-function-return-type': 'warn',
    },
  },
);
```

> [!IMPORTANT] If you get ES module errors, you may need to set the `type` field in your `package.json` to `module` or
> rename your config file to `eslint.config.mjs`.

**Using extends and targetting all files:**

```js
import codfish from '@codfish/eslint-config';

export default defineConfig({
  extends: [codfish],
  rules: {
    // temporary
    '@typescript-eslint/no-explicit-any': 'off',
  },
});
```

**Using extends and targetting specific files:**

> [!WARNING]
>
> **Not recommended.** This will prevent it from using the `files` specified in the main config, so rules around test
> files, yml files, etc. will not be applied.

```js
import codfish from '@codfish/eslint-config';

export default defineConfig({
  files: ['**/*.{js,jsx,ts,tsx}'],
  extends: [codfish],
  rules: {
    // temporary
    '@typescript-eslint/no-explicit-any': 'off',
  },
});
```

**Not using the `defineConfig` function, just spread the config object:**

```js
import codfish from '@codfish/eslint-config';

export default [
  ...codfish,

  {
    // Your project-specific overrides
    rules: {
      // Override or add specific rules
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
];
```

**Use the config without any overrides:**

```js
import codfish from '@codfish/eslint-config';

export default codfish;
```

**Framework-specific customizations:**

```js
import { defineConfig } from 'eslint/config';
import codfish from '@codfish/eslint-config';

export default defineConfig(
  codfish,

  {
    files: ['**/*.spec.{js,ts,jsx,tsx}'],
    rules: {
      // Allow any in test files
      '@typescript-eslint/no-explicit-any': 'off',
      // Relax Testing Library rules if needed
      'testing-library/prefer-screen-queries': 'warn',
    },
  },

  {
    files: ['**/*.config.{js,ts}'],
    rules: {
      // Allow require in config files
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Customize Next.js rules
      '@next/next/no-img-element': 'warn',
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
);
```

**Docker Configuration:**

For projects leveraging Docker containers, you may want to disable import resolution errors for `node_modules` if
packages are only available in the container but you're running the linter locally.

```js
import codfish from '@codfish/eslint-config';
import docker from '@codfish/eslint-config/docker';

export default defineConfig(
  codfish,
  docker,

  {
    // Your app-specific overrides
  },
);
```

**dApps Configuration:**

For decentralized applications that use build artifacts and blockchain globals, use the specialized dApp config. This
config will set some globals as well as ignore missing build artifact imports. While you obviously need those to run
your app, sometimes you might want to run the linter in a ci/cd environment and build artifacts might not be present.

```js
import codfish from '@codfish/eslint-config';
import dapp from '@codfish/eslint-config/dapp';

export default defineConfig(
  codfish,
  dapp,

  {
    // Your app-specific overrides
  },
);
```

The dApp configuration provides:

- Blockchain-specific globals (`artifacts`, `contract`, `web3`, etc.)
- Import resolution handling for smart contract build artifacts
- Relaxed rules for generated contract files

### Opinionated Highlights

This configuration includes some opinionated settings that you might want to customize for your project:

**Prettier/Formatting:**

- **Semicolons**: Enforces semicolons (`;`)
- **120 character line width**: Wider than the common 80/100 - you might prefer shorter lines
- **2-space indentation**: Uses 2 spaces for tabs
- **Single quotes**: Prefers `'single'` over `"double"` quotes
- **Trailing commas**: Adds trailing commas everywhere
- **Arrow parentheses**: Avoids parens around single args (`x => x` not `(x) => x`)

**ESLint Rules:**

- **Import sorting**: Enforces automatic import organization with specific grouping rules
- **Lodash restrictions**: Requires direct imports (`import get from 'lodash-es/get'`) instead of full lodash
- **React hooks deps**: Disables `exhaustive-deps` rule - you might want this stricter
- **Console statements**: Disallows `console.log` in regular code (only allowed in test files) - some teams prefer
  warnings instead of errors
- **Next.js rules**: Enforces Next.js best practices and Core Web Vitals optimization
- **Testing Library rules**: Enforces Testing Library best practices in test files

**File Ignores:**

- Ignores common build directories (`.next`, `coverage`, `.vercel`, etc.)
- Includes `.github` and `.vitepress` folders (not ignored like most configs)

See the [configuration examples below](#usage) for instructions on overriding these settings to match your team's
preferences.

## Prettier Configuration

**Prettier is included and runs automatically** through ESLint for JavaScript, TypeScript, JSX, and TSX files using the
[built-in configuration](./prettier.js). **You don't need to install or configure Prettier separately** for basic usage.

You can then override the default config by creating your own Prettier config file, or extend the built-in config:

**Option 1: Extend the built-in config (Recommended)**

Create a `prettier.config.js` file in your project root:

```js
// prettier.config.js

import codfishConfig from '@codfish/eslint-config/prettier';

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
export default {
  ...codfishConfig,

  // Override specific settings
  printWidth: 80,
  singleQuote: false,
  tabWidth: 4,
  trailingComma: 'none',
};
```

**Option 2: Completely custom config**

This config will completely override the built-in config.

```js
// prettier.config.js

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
export default {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  proseWrap: 'always',
};
```

### Use in combination with prettier-plugin-tailwindcss

```sh
npm i -D eslint@9 @codfish/eslint-config prettier-plugin-tailwindcss
```

```js
// prettier.config.js

import codfish from '@codfish/eslint-config/prettier';

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  ...codfish,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/styles/app.css',
  tailwindFunctions: ['clsx'], // optional
};
```

## Example scripts

Optionally, you can add these scripts to your `package.json` for common linting workflows:

**Basic scripts (no separate Prettier installation needed):**

```json
{
  "scripts": {
    "lint": "eslint .",
    "fix": "eslint . --fix"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix"]
  }
}
```

**With Prettier installed separately (for formatting non-JS files):**

```json
{
  "scripts": {
    "lint": "eslint .",
    "fix": "eslint . --fix",
    "format": "prettier --config ./node_modules/@codfish/eslint-config/prettier.js --write \"**/*.{json,css,md}\"",
    "check": "npm run lint && npm run format -- --check --no-write"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix"],
    "*.{json,css,md}": ["prettier --write --config ./node_modules/@codfish/eslint-config/prettier.js"]
  }
}
```

## Commitlint Configuration

Extend from the shared codfish commitlint config.

```js
import codfishConfig from '@codfish/eslint-config/commitlint.js';

export default Object.assign(codfishConfig, {
  // your overrides here
  rules: {
    'scope-case': [1],
  },
});
```

**Or just reference it in your package.json:**

```json
{
  "commitlint": {
    "extends": ["./node_modules/@codfish/eslint-config/commitlint.js"]
  }
}
```

Run commitlint in your CI to validate your commits:

> [!NOTE]
>
> If you have @codfish/eslint-config as a dev dependency, and a commitlint config in your project, you can just call
> `npx commitlint` in your CI and it will use the shared config.
>
> - You just need to setup node & install your dependencies before running commitlint.
> - Don't forget to set the `fetch-depth` to `0` to ensure commitlint can work properly.

```yaml
# .github/workflows/validate.yml

on: pull_request_target

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v5
        with:
          ref: ${{ github.event.pull_request.head.sha || github.ref }}
          fetch-depth: 0 # Important for commitlint to work

      - uses: actions/setup-node@v5
        with:
          node-version: lts/*
          registry-url: https://registry.npmjs.org

      - run: npm ci # or npm install

      - run:
          npx commitlint --from ${{ github.event.pull_request.base.sha }} --to ${{ github.event.pull_request.head.sha }}
          --verbose
```

## Migration from Legacy Config

If you're upgrading from an older version that used Airbnb presets:

1. **Update to ESLint v9+**: `npm install --save-dev eslint@9`
2. **Switch to flat config**: Replace `.eslintrc.js` with `eslint.config.js`
3. **Use import syntax**: Change from `require()` to `import` statements
4. **Remove explicit React config**: React support is now automatically detected
5. **Update scripts**: Ensure your lint script runs `eslint .` (flat config auto-discovery)
