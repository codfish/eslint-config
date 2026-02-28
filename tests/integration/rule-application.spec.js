import { ESLint } from 'eslint';
import { expect, test } from 'vitest';

import config from '../../index.js';

// Helper function to lint code samples
async function lintCode(code, filename = 'test.js') {
  const eslint = new ESLint({
    baseConfig: config,
    overrideConfigFile: true,
  });

  const results = await eslint.lintText(code, { filePath: filename });
  return results[0];
}

test('allows const and let declarations', async () => {
  const code = `
const message = 'hello';
let count = 0;
count += 1;

export { message, count };
`;

  const result = await lintCode(code);

  // Should not have const/let usage errors
  const constLetErrors = result.messages.filter(msg => msg.ruleId === 'no-var' || msg.ruleId === 'prefer-const');
  expect(constLetErrors.length).toBe(0);
});

test('enforces semicolons', async () => {
  const code = `const message = 'hello'`;

  const result = await lintCode(code);
  expect(result.errorCount).toBeGreaterThan(0);

  const prettierErrors = result.messages.filter(msg => msg.ruleId === 'prettier/prettier');
  expect(prettierErrors.length).toBeGreaterThan(0);
});

test('enforces single quotes', async () => {
  const code = `const message = "hello world";`;

  const result = await lintCode(code);
  expect(result.errorCount).toBeGreaterThan(0);

  const quoteErrors = result.messages.filter(msg => msg.ruleId === 'prettier/prettier');
  expect(quoteErrors.length).toBeGreaterThan(0);
});

test('disallows console.log in regular files', async () => {
  const code = `
function doSomething() {
  console.log('debug message');
  return true;
}
`;

  const result = await lintCode(code, 'src/utils.js');

  const consoleErrors = result.messages.filter(msg => msg.ruleId === 'no-console');
  expect(consoleErrors.length).toBeGreaterThan(0);
});

test('allows console.log in test files', async () => {
  const code = `
import { test, expect } from 'vitest';

test('something works', () => {
  console.log('test debug message');
  expect(true).toBe(true);
});
`;

  const result = await lintCode(code, 'src/utils.test.js');

  const consoleErrors = result.messages.filter(msg => msg.ruleId === 'no-console');
  expect(consoleErrors.length).toBe(0);
});

test('enforces import/export order', async () => {
  const code = `
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { myUtil } from './utils.js';

export const config = {};
`;

  const result = await lintCode(code);

  // Should have import sorting issues
  const sortErrors = result.messages.filter(msg => msg.ruleId === 'simple-import-sort/imports');
  expect(sortErrors.length).toBeGreaterThan(0);
});

test('TypeScript files get TypeScript rules', async () => {
  const code = `
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: 'John',
  age: 30
};

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}
`;

  const result = await lintCode(code, 'src/user.ts');

  // Should not have TypeScript parsing errors
  const syntaxErrors = result.messages.filter(msg => msg.severity === 2 && msg.fatal);
  expect(syntaxErrors.length).toBe(0);
});

test('TypeScript @typescript-eslint rules are applied', async () => {
  const code = `
const unusedVariable = 42;
export const used = 1;
`;

  const result = await lintCode(code, 'src/module.ts');

  // @typescript-eslint/no-unused-vars should flag the unused variable
  const unusedVarErrors = result.messages.filter(
    msg => msg.ruleId === '@typescript-eslint/no-unused-vars' && msg.message?.includes('unusedVariable'),
  );
  expect(unusedVarErrors.length).toBeGreaterThan(0);
});

test('React JSX files get React rules', async () => {
  const code = `
import React from 'react';

function Component() {
  const handleClick = () => {
    console.log('clicked');
  };

  return (
    <button onClick={handleClick}>
      Click me
    </button>
  );
}

export default Component;
`;

  const result = await lintCode(code, 'src/Component.jsx');

  // Should not have JSX parsing errors
  const syntaxErrors = result.messages.filter(msg => msg.severity === 2 && msg.fatal);
  expect(syntaxErrors.length).toBe(0);
});

test('YAML files get YAML rules', async () => {
  const code = `
name: test-workflow
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
`;

  const result = await lintCode(code, '.github/workflows/test.yml');

  // Should not have YAML parsing errors
  const syntaxErrors = result.messages.filter(msg => msg.severity === 2 && msg.fatal);
  expect(syntaxErrors.length).toBe(0);
});

test('config files allow dev dependencies', async () => {
  const code = `
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
});
`;

  const result = await lintCode(code, 'vitest.config.js');

  // Should not have import/no-extraneous-dependencies errors
  const importErrors = result.messages.filter(msg => msg.ruleId === 'import/no-extraneous-dependencies');
  expect(importErrors.length).toBe(0);
});
