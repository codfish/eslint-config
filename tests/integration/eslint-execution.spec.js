import { ESLint } from 'eslint';
import { mkdir, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { expect, test } from 'vitest';

import config from '../../index.js';

// Helper to create temporary project structure
async function createTempProject(files) {
  const tempDir = join(tmpdir(), `eslint-test-${Date.now()}`);
  await mkdir(tempDir, { recursive: true });

  for (const [filepath, content] of Object.entries(files)) {
    const fullPath = join(tempDir, filepath);
    const dir = join(fullPath, '..');
    await mkdir(dir, { recursive: true });
    await writeFile(fullPath, content, 'utf-8');
  }

  return tempDir;
}

// Helper to run ESLint on temp project
async function lintProject(tempDir, patterns = ['**/*.{js,ts,jsx,tsx,yml,yaml}']) {
  const eslint = new ESLint({
    baseConfig: config,
    overrideConfigFile: true,
    cwd: tempDir,
  });

  const results = await eslint.lintFiles(patterns);
  return results;
}

test('lints a basic JavaScript project', async () => {
  const files = {
    'package.json': JSON.stringify({
      name: 'test-project',
      type: 'module',
    }),
    'src/index.js': `
const message = 'Hello, world!';
console.log(message);
export default message;
`,
    'src/utils.js': `
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}
`,
  };

  const tempDir = await createTempProject(files);

  try {
    const results = await lintProject(tempDir);

    // Should have some results
    expect(results.length).toBeGreaterThan(0);

    // Should not have any fatal errors
    const fatalErrors = results.flatMap(r => r.messages).filter(msg => msg.fatal);
    expect(fatalErrors.length).toBe(0);

    // Should flag console.log in non-test files
    const consoleErrors = results.flatMap(r => r.messages).filter(msg => msg.ruleId === 'no-console');
    expect(consoleErrors.length).toBeGreaterThan(0);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('lints a React project with TypeScript', async () => {
  const files = {
    'package.json': JSON.stringify({
      name: 'test-react-project',
      type: 'module',
      dependencies: {
        react: '^18.0.0',
        'react-dom': '^18.0.0',
      },
      devDependencies: {
        typescript: '^5.0.0',
      },
    }),
    'src/App.tsx': `
import React, { useState } from 'react';

interface Props {
  title: string;
}

export function App({ title }: Props) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>{title}</h1>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}
`,
    'src/utils.ts': `
export interface User {
  id: number;
  name: string;
  email: string;
}

export function formatUser(user: User): string {
  return \`\${user.name} <\${user.email}>\`;
}
`,
  };

  const tempDir = await createTempProject(files);

  try {
    const results = await lintProject(tempDir);

    // Should parse TypeScript and JSX without errors
    const syntaxErrors = results.flatMap(r => r.messages).filter(msg => msg.fatal);
    expect(syntaxErrors.length).toBe(0);

    // Should apply React rules - no violations expected, just checking config is applied
    // const hasReactMessages = results.some(result =>
    //   result.messages.some(msg => msg.ruleId && msg.ruleId.startsWith('react/')),
    // );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('lints test files with testing rules', async () => {
  const files = {
    'package.json': JSON.stringify({
      name: 'test-project-with-tests',
      type: 'module',
      devDependencies: {
        vitest: '^1.0.0',
        '@testing-library/react': '^14.0.0',
      },
    }),
    'src/math.js': `
export function add(a, b) {
  return a + b;
}
`,
    'src/math.test.js': `
import { test, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import { add } from './math.js';

test('adds numbers correctly', () => {
  console.log('Testing addition'); // Should be allowed in tests
  expect(add(2, 3)).toBe(5);
});

test('renders component', () => {
  render(<div>Hello</div>);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
`,
  };

  const tempDir = await createTempProject(files);

  try {
    const results = await lintProject(tempDir);

    // Should not have console.log errors in test files
    const testFileResults = results.filter(r => r.filePath.includes('.test.'));
    const consoleErrorsInTests = testFileResults.flatMap(r => r.messages).filter(msg => msg.ruleId === 'no-console');
    expect(consoleErrorsInTests.length).toBe(0);

    // Should not have import errors for testing library
    const importErrors = results
      .flatMap(r => r.messages)
      .filter(msg => msg.ruleId === 'import/no-extraneous-dependencies' && msg.message.includes('@testing-library'));
    expect(importErrors.length).toBe(0);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('lints YAML files', async () => {
  const files = {
    'package.json': JSON.stringify({
      name: 'test-yaml-project',
    }),
    '.github/workflows/ci.yml': `
name: CI
on:
  push:
    branches: [main]
  pull_request_target:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
`,
    'docker-compose.yml': `
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
`,
  };

  const tempDir = await createTempProject(files);

  try {
    const results = await lintProject(tempDir, ['**/*.{yml,yaml}']);

    // Should parse YAML files without fatal errors
    const syntaxErrors = results.flatMap(r => r.messages).filter(msg => msg.fatal);
    expect(syntaxErrors.length).toBe(0);

    // Should have some YAML-specific linting
    const yamlResults = results.filter(r => r.filePath.endsWith('.yml') || r.filePath.endsWith('.yaml'));
    expect(yamlResults.length).toBeGreaterThan(0);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('handles config files specially', async () => {
  const files = {
    'package.json': JSON.stringify({
      name: 'test-config-project',
      type: 'module',
      devDependencies: {
        vitest: '^1.0.0',
        '@vitejs/plugin-react': '^4.0.0',
      },
    }),
    'vitest.config.js': `
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
});
`,
    'eslint.config.js': `
import codfishConfig from '@codfish/eslint-config';

export default [
  ...codfishConfig,
  {
    rules: {
      'no-console': 'warn',
    },
  },
];
`,
  };

  const tempDir = await createTempProject(files);

  try {
    const results = await lintProject(tempDir, ['*.config.js']);

    // Should not have import/no-extraneous-dependencies errors for dev deps in config files
    const configFileResults = results.filter(r => r.filePath.includes('.config.js'));
    const devDepErrors = configFileResults
      .flatMap(r => r.messages)
      .filter(msg => msg.ruleId === 'import/no-extraneous-dependencies');
    expect(devDepErrors.length).toBe(0);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('respects ignores configuration', async () => {
  const files = {
    'package.json': JSON.stringify({
      name: 'test-ignores-project',
    }),
    'src/main.js': `
const message = 'This should be linted';
console.log(message);
`,
    'dist/bundle.js': `
// Generated file - should be ignored
var uglified = function() { console.log("bad formatting"); };
`,
    'node_modules/some-package/index.js': `
// Should be ignored
module.exports = {};
`,
    'coverage/lcov-report/index.html': `
<!-- Coverage report - should be ignored -->
<html><body>Coverage</body></html>
`,
    '.next/static/js/bundle.js': `
// Next.js build file - should be ignored
console.log("bad formatting");
`,
    'pnpm-lock.yaml': `
# PNPM lock file - should be ignored
lockfileVersion: '6.0'
dependencies:
  react: ^18.0.0
`,
    '.eslintcache': 'eslint cache file content',
    '.turbo/cache/abc123.log': 'turbo cache file',
    'storybook-static/index.html': '<html>Storybook static</html>',
    '.vite/deps/react.js': '// Vite cache',
  };

  const tempDir = await createTempProject(files);

  try {
    const results = await lintProject(tempDir);

    // Should lint src files
    const srcResults = results.filter(r => r.filePath.includes('/src/'));
    expect(srcResults.length).toBeGreaterThan(0);

    // Should not lint any of the ignored files/directories
    const ignoredPaths = [
      '/dist/',
      '/node_modules/',
      '/coverage/',
      '/.next/',
      'pnpm-lock.yaml',
      '.eslintcache',
      '/.turbo/',
      '/storybook-static/',
      '/.vite/',
    ];

    ignoredPaths.forEach(ignoredPath => {
      const ignoredResults = results.filter(r => r.filePath.includes(ignoredPath));
      expect(ignoredResults.length).toBe(0);
    });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
