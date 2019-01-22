# eslint-config-codfish [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

Opinionated ESLint configuration that extends airbnb to not conflict with prettier.

## Features

- Uses [Airbnb's config](https://github.com/airbnb/javascript/tree/master/packages) as the foundation.
- Leverages [prettier's eslint plugin](https://github.com/prettier/eslint-plugin-prettier), which run's prettier within ESLint, and turns off rules that may conflict with Airbnb's config.
- Supports both React & non-React applications dynamically based on your project's dependencies.
- Extends [Kent C Dodd's Jest config](https://github.com/kentcdodds/eslint-config-kentcdodds/blob/master/jest.js) dynamically based on your project's dependencies.
- Helpful opt-in config for apps using Docker.
- Helpful opt-in config for dApp's.

## Install

Install dependencies:

```sh
npm install --save-dev --save-exact prettier
npx install-peerdeps --dev eslint-config-codfish
```

## Usage

[My recommended setup](https://gist.github.com/codfish/91ef26f3a56a5c5ca0912aa8c0c5c020) includes tools like husky, lint-staged & commitlint in addition to prettier & eslint. However that's optional.

### .eslintrc.js

```js
module.exports = {
  extends: ['codfish'],
  rules: {
    // your overrides here
  },
};
```

### .prettierrc.js

```js
module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
};
```

### .package.json

```json
{
  "scripts": {
    "fix": "npm run format && npm run lint -- --fix",
    "format": "prettier --write \"**/*.{json,css,scss,html}\"",
    "lint": "eslint ."
  }
}
```

Run `npm run fix` from a git hook.

Run `npm run lint` in a ci/cd environment.

### With Docker

Using Docker? `node_modules` should be installed and present in your containers, but not needed/mounted on the host machine. `ESLint` will complain about this however because it won't be able to resolve the dependencies locally. Pull in the docker ruleset to adjust some rules to prevent these types of failures.

**NOTE:** All this config basically does is ignore the [`import/no-unresolved`](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unresolved.md) rule for imports that don't start with a period.

```js
module.exports = {
  extends: ['codfish', 'codfish/docker'],
  rules: {
    // your overrides here
  },
};
```

### With dApps

Similar to the issues with docker, there may be rules you want to adjust for dApp's. This config will set some globals as well as ignore missing build artifact imports. While you obviously need those to run your app, sometimes you might want to run the linter in a ci/cd environment and build artifacts might not be present.

**Note**: The dApp config also includes the `import/no-unresolved` rule found in the docker config.

```js
module.exports = {
  extends: ['codfish', 'codfish/dapp'],
  rules: {
    // your overrides here
  },
};
```
