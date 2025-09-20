import { ESLint } from 'eslint';
import { readPackageUp } from 'read-package-up';
import { expect, test, vi } from 'vitest';

// Mock read-package-up for scenario testing
vi.mock('read-package-up');

// Helper to lint with mocked dependencies
async function lintWithMockedDeps(code, filename, mockPackageJson) {
  vi.mocked(readPackageUp).mockResolvedValue({
    packageJson: mockPackageJson,
    path: '/mock/package.json',
  });

  // Import the config fresh for this test
  const { default: config } = await import('../../index.js');

  const eslint = new ESLint({
    baseConfig: config,
    overrideConfigFile: true,
  });

  const results = await eslint.lintText(code, { filePath: filename });
  return results[0];
}

test('handles project with no dependencies', async () => {
  const code = `
const message = 'hello';
export default message;
`;

  const result = await lintWithMockedDeps(code, 'src/index.js', {
    name: 'minimal-project',
    dependencies: {},
    devDependencies: {},
  });

  // Should still work with base configuration
  const fatalErrors = result.messages.filter(msg => msg.fatal);
  expect(fatalErrors.length).toBe(0); // Ensure linting did not produce fatal errors
});

test('handles project with React but no TypeScript', async () => {
  const code = `
import React from 'react';

function Component() {
  return <div>Hello World</div>;
}

export default Component;
`;

  const result = await lintWithMockedDeps(code, 'src/Component.jsx', {
    name: 'react-only-project',
    dependencies: {
      react: '^18.0.0',
    },
  });

  // Should parse JSX without TypeScript errors
  const fatalErrors = result.messages.filter(msg => msg.fatal);
  expect(fatalErrors.length).toBe(0);
});

test('handles project with TypeScript but no React', async () => {
  const code = `
interface User {
  id: number;
  name: string;
}

export function createUser(name: string): User {
  return {
    id: Math.random(),
    name,
  };
}
`;

  const result = await lintWithMockedDeps(code, 'src/user.ts', {
    name: 'typescript-only-project',
    devDependencies: {
      typescript: '^5.0.0',
    },
  });

  // Should parse TypeScript without React rules interfering
  const fatalErrors = result.messages.filter(msg => msg.fatal);
  expect(fatalErrors.length).toBe(0);
});

test('handles project with both Jest and Vitest', async () => {
  const code = `
import { test, expect } from 'vitest';
import { describe } from '@jest/globals';

describe('mixed testing setup', () => {
  test('works with both frameworks', () => {
    expect(true).toBe(true);
  });
});
`;

  const result = await lintWithMockedDeps(code, 'src/utils.test.js', {
    name: 'mixed-testing-project',
    devDependencies: {
      jest: '^29.0.0',
      vitest: '^1.0.0',
    },
  });

  // Should handle both testing frameworks
  const fatalErrors = result.messages.filter(msg => msg.fatal);
  expect(fatalErrors.length).toBe(0);
});

test('handles Next.js project with all features', async () => {
  const code = `
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  title: string;
}

export default function Page({ title }: Props) {
  return (
    <div>
      <h1>{title}</h1>
      <Link href="/about">
        <Image src="/logo.png" alt="Logo" width={100} height={100} />
      </Link>
    </div>
  );
}
`;

  const result = await lintWithMockedDeps(code, 'src/pages/index.tsx', {
    name: 'nextjs-project',
    dependencies: {
      react: '^18.0.0',
      next: '^14.0.0',
    },
    devDependencies: {
      typescript: '^5.0.0',
    },
  });

  // Should handle Next.js + React + TypeScript combination
  const fatalErrors = result.messages.filter(msg => msg.fatal);
  expect(fatalErrors.length).toBe(0);
});

test('handles deeply nested file paths', async () => {
  const code = `
export const config = {
  api: {
    url: 'https://api.example.com',
  },
};
`;

  const result = await lintWithMockedDeps(code, 'src/features/auth/components/forms/LoginForm.tsx', {
    name: 'deeply-nested-project',
    dependencies: {
      react: '^18.0.0',
    },
    devDependencies: {
      typescript: '^5.0.0',
    },
  });

  // Should handle deeply nested paths correctly
  const fatalErrors = result.messages.filter(msg => msg.fatal);
  expect(fatalErrors.length).toBe(0);
});

test('handles file with unusual but valid syntax', async () => {
  const code = `
export const complexObject = {
  ...(condition && { conditionalProp: 'value' }),
  nested: {
    array: [1, 2, 3].map(n => ({ value: n })),
    asyncFn: async () => {
      try {
        const result = await fetch('/api');
        return await result.json();
      } catch (error) {
        console.error('Failed to fetch', error);
        throw error;
      }
    },
  },
  [Symbol.iterator]: function* () {
    yield 1;
    yield 2;
    yield 3;
  },
};
`;

  const result = await lintWithMockedDeps(code, 'src/complex.js', {
    name: 'complex-syntax-project',
  });

  // Should handle complex modern JavaScript syntax
  const syntaxErrors = result.messages.filter(
    msg => msg.fatal || (msg.severity === 2 && msg.message.includes('Parsing error')),
  );
  expect(syntaxErrors.length).toBe(0);
});

test('handles mixed file extensions in project', async () => {
  // Test that the configuration handles projects with various file types
  const testFiles = [
    { code: 'export const js = "file";', filename: 'src/utils.js' },
    { code: 'export const ts: string = "file";', filename: 'src/types.ts' },
    { code: 'import React from "react"; export default () => <div />;', filename: 'src/Component.jsx' },
    {
      code: 'import React from "react"; const Component: React.FC = () => <div />; export default Component;',
      filename: 'src/TypedComponent.tsx',
    },
  ];

  const mockPackageJson = {
    name: 'mixed-extensions-project',
    dependencies: {
      react: '^18.0.0',
    },
    devDependencies: {
      typescript: '^5.0.0',
    },
  };

  for (const { code, filename } of testFiles) {
    const result = await lintWithMockedDeps(code, filename, mockPackageJson);

    // Each file type should parse without fatal errors
    const fatalErrors = result.messages.filter(msg => msg.fatal);
    expect(fatalErrors.length).toBe(0);
  }
});

test('handles empty files and minimal content', async () => {
  const testCases = [
    { code: '', filename: 'empty.js' },
    { code: '// Just a comment', filename: 'comment-only.js' },
    { code: 'export {};', filename: 'empty-module.js' },
    { code: 'const a = 1;', filename: 'minimal.js' },
  ];

  for (const { code, filename } of testCases) {
    const result = await lintWithMockedDeps(code, filename, {
      name: 'minimal-content-project',
    });

    // Should handle edge cases gracefully
    const fatalErrors = result.messages.filter(msg => msg.fatal);
    expect(fatalErrors.length).toBe(0);
  }
});

test('handles CommonJS and ESM module patterns', async () => {
  // Test CommonJS syntax
  const cjsCode = 'module.exports = {};';
  const cjsResult = await lintWithMockedDeps(cjsCode, 'test.js', {
    name: 'commonjs-project',
  });

  // Test ESM syntax
  const esmCode = 'export default {};';
  const esmResult = await lintWithMockedDeps(esmCode, 'test.js', {
    name: 'esm-project',
    type: 'module',
  });

  // Both should parse without fatal errors
  const cjsFatalErrors = cjsResult.messages.filter(msg => msg.fatal);
  const esmFatalErrors = esmResult.messages.filter(msg => msg.fatal);

  expect(cjsFatalErrors.length).toBe(0);
  expect(esmFatalErrors.length).toBe(0);
});
