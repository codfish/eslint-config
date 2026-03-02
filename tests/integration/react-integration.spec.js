import { ESLint } from 'eslint';
import { readPackageUpSync } from 'read-package-up';
import { expect, test, vi } from 'vitest';

// Mock read-package-up to simulate React projects (the eslint-config project
// itself doesn't have react, so the React config wouldn't load otherwise).
vi.mock('read-package-up', () => ({
  readPackageUpSync: vi.fn(),
}));

// Helper to lint code as if in a project with the given package.json.
// Does NOT override plugin settings like react.version — exercises
// real plugin code paths (e.g. version: 'detect').
async function lintAsProject(code, filename, mockPackageJson) {
  vi.mocked(readPackageUpSync).mockReturnValue({
    packageJson: mockPackageJson,
    path: '/mock/package.json',
  });

  vi.resetModules();
  const { default: config } = await import('../../index.js');

  const eslint = new ESLint({
    baseConfig: config,
    overrideConfigFile: true,
  });

  const results = await eslint.lintText(code, { filePath: filename });
  return results[0];
}

test('React plugin works with version: detect on JSX files', async () => {
  const code = `
import React from 'react';

function App() {
  return <div>Hello World</div>;
}

export default App;
`;

  const result = await lintAsProject(code, 'src/App.jsx', {
    name: 'react-project',
    dependencies: {
      react: '^18.0.0',
      'react-dom': '^18.0.0',
    },
  });

  // Should not crash with errors like "contextOrFilename.getFilename is not a function"
  const fatalErrors = result.messages.filter(msg => msg.fatal);
  expect(fatalErrors.length).toBe(0);
});

test('React plugin works with version: detect on TSX files', async () => {
  const code = `
import React from 'react';

interface Props {
  title: string;
}

export default function Page({ title }: Props) {
  return <h1>{title}</h1>;
}
`;

  const result = await lintAsProject(code, 'src/Page.tsx', {
    name: 'react-ts-project',
    dependencies: {
      react: '^18.0.0',
      'react-dom': '^18.0.0',
    },
    devDependencies: {
      typescript: '^5.0.0',
    },
  });

  // Should not crash with errors like "contextOrFilename.getFilename is not a function"
  const fatalErrors = result.messages.filter(msg => msg.fatal);
  expect(fatalErrors.length).toBe(0);
});

test('React plugin works with version: detect in Next.js project', async () => {
  const code = `
import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  return (
    <div>
      <Link href="/about">About</Link>
      <Image src="/logo.png" alt="Logo" width={100} height={100} />
    </div>
  );
}
`;

  const result = await lintAsProject(code, 'src/app/page.tsx', {
    name: 'nextjs-project',
    dependencies: {
      react: '^18.0.0',
      'react-dom': '^18.0.0',
      next: '^14.0.0',
    },
    devDependencies: {
      typescript: '^5.0.0',
    },
  });

  // Should not crash with errors like "contextOrFilename.getFilename is not a function"
  const fatalErrors = result.messages.filter(msg => msg.fatal);
  expect(fatalErrors.length).toBe(0);
});
