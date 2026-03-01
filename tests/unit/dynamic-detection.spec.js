vi.mock('read-package-up', () => ({
  readPackageUpSync: vi.fn(() => ({ packageJson: {}, path: '/test/package.json' })),
}));

let readPackageUpSyncMock;

beforeEach(async () => {
  vi.resetModules();
  const mod = await import('read-package-up');
  readPackageUpSyncMock = mod.readPackageUpSync;
});

// Helper to set mock package.json
function mockPkg(packageJson = {}) {
  readPackageUpSyncMock.mockReturnValueOnce({ packageJson, path: '/test/package.json' });
}

// React Configuration
test('includes React configuration when React is detected', async () => {
  mockPkg({ dependencies: { react: '^18.0.0' } });
  const { default: config } = await import('../../index.js');

  const hasReactConfig = config.some(item => item.name?.includes('react'));
  expect(hasReactConfig).toBe(true);
});

test('excludes React configuration when React is not detected', async () => {
  mockPkg();
  const { default: config } = await import('../../index.js');

  const hasReactConfig = config.some(item => item.name?.includes('react'));
  expect(hasReactConfig).toBe(false);
});

// TypeScript Configuration
test('includes TypeScript configuration when TypeScript is detected', async () => {
  mockPkg({ devDependencies: { typescript: '^5.0.0' } });
  const { default: config } = await import('../../index.js');

  const baseConfig = config.find(item => item.name === 'codfish/base');
  expect(baseConfig?.rules?.['@typescript-eslint/no-unused-vars']).toBeDefined();
});

test('excludes TypeScript configuration when TypeScript is not detected', async () => {
  mockPkg();
  const { default: config } = await import('../../index.js');

  const baseConfig = config.find(item => item.name === 'codfish/base');
  expect(baseConfig?.rules?.['@typescript-eslint/no-unused-vars']).toBeUndefined();
});

// Test Framework Configuration
test('includes test configuration when Vitest is detected', async () => {
  mockPkg({ devDependencies: { vitest: '^1.0.0' } });
  const { default: config } = await import('../../index.js');

  const hasTestsConfig = config.some(item => item.name === 'codfish/tests');
  expect(hasTestsConfig).toBe(true);
});

test('includes test configuration when Jest is detected', async () => {
  mockPkg({ devDependencies: { jest: '^29.0.0' } });
  const { default: config } = await import('../../index.js');

  const hasTestsConfig = config.some(item => item.name === 'codfish/tests');
  expect(hasTestsConfig).toBe(true);
});

test('excludes test configuration when no test framework is detected', async () => {
  mockPkg();
  const { default: config } = await import('../../index.js');

  const hasTestsConfig = config.some(item => item.name === 'codfish/tests');
  expect(hasTestsConfig).toBe(false);
});

// Base Configuration (always included)
test('always includes base configurations regardless of dependencies', async () => {
  mockPkg();
  const { default: config } = await import('../../index.js');

  const configNames = config.filter(item => item.name).map(item => item.name);

  expect(configNames).toContain('codfish/base');
  expect(configNames).toContain('codfish/ignores');
  expect(configNames).toContain('codfish/config-files');
  expect(configNames).toContain('codfish/json');
  expect(configNames).toContain('codfish/jsonc');
  expect(configNames).toContain('codfish/json5');
  expect(configNames).toContain('codfish/html');
  expect(configNames).toContain('codfish/markdown');
});

test('always includes YAML configuration', async () => {
  mockPkg();
  const { default: config } = await import('../../index.js');

  const hasYamlRules = config.some(item => item.rules && Object.keys(item.rules).some(rule => rule.startsWith('yml/')));
  expect(hasYamlRules).toBe(true);
});

test('always includes JSON configuration', async () => {
  mockPkg();
  const { default: config } = await import('../../index.js');

  const hasJsonRules = config.some(
    item => item.rules && Object.keys(item.rules).some(rule => rule.startsWith('json/')),
  );
  expect(hasJsonRules).toBe(true);
});

test('includes prettier configuration as last item', async () => {
  mockPkg();
  const { default: config } = await import('../../index.js');

  const lastConfig = config[config.length - 1];
  expect(lastConfig.rules?.['prettier/prettier']).toBeDefined();
});

// Config Structure Validation
test('config structure is valid for ESLint flat config', async () => {
  mockPkg({ dependencies: { react: '^18.0.0' }, devDependencies: { vitest: '^1.0.0' } });
  const { default: config } = await import('../../index.js');

  config.forEach(configItem => {
    expect(configItem).toBeTypeOf('object');
    expect(configItem).not.toBeNull();

    const hasValidProperty =
      configItem.rules ||
      configItem.plugins ||
      configItem.languageOptions ||
      configItem.files ||
      configItem.ignores ||
      configItem.name;

    expect(hasValidProperty).toBeTruthy();
  });
});

test('no duplicate configuration names', async () => {
  mockPkg({ dependencies: { react: '^18.0.0' }, devDependencies: { vitest: '^1.0.0' } });
  const { default: config } = await import('../../index.js');

  const names = config.filter(item => item.name).map(item => item.name);
  const uniqueNames = new Set(names);
  expect(uniqueNames.size).toBe(names.length);
});
