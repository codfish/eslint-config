# @codfish/eslint-config

> Modern ESLint configuration with TypeScript, React, and testing framework support using ESLint v9+ flat config format.

[![version](https://img.shields.io/npm/v/@codfish/eslint-config.svg)](http://npm.im/@codfish/eslint-config)
[![downloads](https://img.shields.io/npm/dm/@codfish/eslint-config.svg)](http://npm-stat.com/charts.html?package=@codfish/eslint-config&from=2015-08-01)
[![MIT License](https://img.shields.io/npm/l/@codfish/eslint-config.svg)](http://opensource.org/licenses/MIT)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [Features](#features)
  - [Automatic Configuration](#automatic-configuration)
- [Installation](#installation)
- [Usage](#usage)
  - [Prettier](#prettier)
  - [With dApps](#with-dapps)
  - [Docker Configuration](#docker-configuration)
  - [Blockchain/dApp Configuration](#blockchaindapp-configuration)
- [Known issues](#known-issues)
- [Migration from Legacy Config](#migration-from-legacy-config)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features

- **Modern ESLint v9+ flat config**: Uses the new flat configuration format
- **Dynamic feature detection**: Automatically configures based on your project's dependencies
- **TypeScript support**: Full TypeScript linting with modern typescript-eslint parser and rules
- **React ecosystem**: React, React Hooks, and JSX accessibility rules when React is detected
- **Test framework agnostic**: Supports Jest and Vitest with automatic detection
- **Prettier integration**: Built-in Prettier configuration with conflict resolution via eslint-config-prettier
- **ESM architecture**: Built with ECMAScript modules and full TypeScript typing
- **Docker support**: Optional configuration for dockerized applications
- **Blockchain/dApp support**: Optional configuration for decentralized applications

### Automatic Configuration

The config automatically detects and configures:

- **React**: Includes React, React Hooks, and JSX a11y rules when `react` is installed
- **Jest**: Configures Jest-specific rules when `jest` is found in dependencies
- **Vitest**: Configures Vitest-specific rules when `vitest` is detected
- **Prettier**: Loads your project's Prettier config or falls back to built-in defaults

## Installation

Install the package and required peer dependencies:

```sh
npm i -D @codfish/eslint-config eslint@9
```

## Usage

Create an `eslint.config.js` file in your project root:

```js
import { defineConfig } from 'eslint/config';
import codfish from '@codfish/eslint-config';

export default defineConfig([
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [codfish],
    // Your overrides here
  },
]);
```

> [!IMPORTANT] If you get ES module errors, you may need to set the `type` field in your `package.json` to `module` or
> rename your config file to `eslint.config.mjs`.

### Prettier

Prettier is automatically run through eslint with the [default configuration](./prettier.js). You can optionally add a
prettier configuration file in the root of your project and it will take precedence over the
[built-in config](./prettier.js). You can also choose to extend the Prettier config:

**prettier.config.js**

```js
import codfishConfig from '@codfish/eslint-config/prettier.js';

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  ...codfishConfig,
  // your overrides here
};

export default config;
```

### With dApps

Similar to the issues with docker, there may be rules you want to adjust for dApp's. This config will set some globals
as well as ignore missing build artifact imports. While you obviously need those to run your app, sometimes you might
want to run the linter in a ci/cd environment and build artifacts might not be present.

**Note**: The dApp config also includes the `import/no-unresolved` rule found in the docker config.

You can also directly import the Prettier config:

```js
import prettierConfig from '@codfish/eslint-config/prettier';
export default prettierConfig;
```

### Docker Configuration

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

### Blockchain/dApp Configuration

For decentralized applications that use build artifacts and blockchain globals, use the specialized dApp config:

```js
import codfish from '@codfish/eslint-config';
import dappConfig from '@codfish/eslint-config/dapp';

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

## Known issues

> https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/149

When building dynamic classes, the auto sorting of tailwind classes can break things so beware.

To avoid this happening you can re-wrap the dynamic class expression like so:

```vue-html
class="`p-0 ${`tw-border-${accentColor}`}`"
```

## Migration from Legacy Config

If you're upgrading from an older version that used Airbnb presets:

1. **Update to ESLint v9+**: `npm install --save-dev eslint@9`
2. **Switch to flat config**: Replace `.eslintrc.js` with `eslint.config.js`
3. **Use import syntax**: Change from `require()` to `import` statements
4. **Remove explicit React config**: React support is now automatically detected
5. **Update scripts**: Ensure your lint script runs `eslint .` (flat config auto-discovery)
