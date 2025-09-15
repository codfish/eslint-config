# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Commands

- **Build**: `npm run build` - Compiles TypeScript types to dist/ directory
- **Dev**: `npm run dev` - Runs TypeScript compilation in watch mode
- **Lint**: `npm run lint` - Runs ESLint on the entire codebase using flat config
- **Format**: `npm run format` - Formats files with Prettier and auto-fixes ESLint issues
- **Test**: `npm run test` - Runs Vitest test suite

## Architecture

This is a modern ESLint configuration package built on ESLint v9+ flat config format with TypeScript
support and ESM. It provides dynamic feature detection and modern recommended presets while
maintaining backward compatibility.

### Core Structure

- **Main config**: `index.js` - Primary ESLint flat configuration with dynamic dependency detection
- **Specialized configs**:
  - `prettier.js` - Standalone Prettier configuration with TypeScript typing
  - `dapp.js` - Configuration for decentralized applications with blockchain globals
  - `docker.js` - Rules for Docker environments (legacy, may need updating)
- **Rule modules** in `rules/`:
  - `react.js` - React, React Hooks, and JSX accessibility rules using flat config
  - `babel.js` - Babel parser configurations with defineConfig typing
  - `jest.js` - Jest testing framework rules
  - `vitest.js` - Vitest testing framework rules
  - `config-files.js` - Special rules for configuration files
  - `import.js` - Import/export linting rules

### Modern ESLint v9+ Features

- **Flat configuration format**: Uses new ESLint flat config instead of legacy .eslintrc
- **TypeScript compilation**: Source .js files compiled to dist/ with full type checking
- **ESM architecture**: Full ECMAScript modules with "type": "module"
- **Modern presets**: Uses @eslint/js, typescript-eslint, and modern plugin recommendations
- **defineConfig typing**: All config files use defineConfig() for type safety

### Dynamic Configuration System

The main `index.js` uses utility functions from `utils.js` to conditionally apply configurations:

- Uses `ifAnyDep()` to detect installed packages and automatically include relevant configs
- Dynamically includes React configuration when React is detected
- Automatically includes TypeScript rules when TypeScript is present
- Detects and configures Jest or Vitest testing frameworks
- Loads project Prettier config with fallback to built-in configuration

### Build System

- **TypeScript compilation**: Source .js files with JSDoc types compiled to dist/
- **Type checking**: TypeScript checkJs option validates JavaScript files
- **Package exports**: Provides typed exports for main config, prettier, and dapp configs
- **Development workflow**: Watch mode for continuous compilation during development

### Key Features

- **Automatic dependency detection**: Configuration adapts based on consuming project dependencies
- **Modern plugin ecosystem**: Uses latest React, TypeScript, and testing plugins
- **TypeScript support**: Full TypeScript checking and configuration via flat config overrides
- **Test framework agnostic**: Supports both Jest and Vitest with automatic detection
- **Config file handling**: Special rules for configuration files allowing dev dependencies
- **Prettier integration**: Built-in Prettier configuration with conflict resolution
- **dApp support**: Blockchain-specific globals and import handling for smart contracts
