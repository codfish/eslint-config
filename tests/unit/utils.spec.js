import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { hasAnyDep, hasDep, hasLocalConfig, ifAnyDep } from '../../utils.js';

// Mock cosmiconfig
vi.mock('cosmiconfig', () => ({
  cosmiconfigSync: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('ifAnyDep returns truthy value when dependency exists', () => {
  // vitest is in our devDependencies
  const result = ifAnyDep('vitest', 'has-vitest', 'no-vitest');
  expect(result).toBe('has-vitest');
});

test('ifAnyDep returns falsy value when dependency does not exist', () => {
  const result = ifAnyDep('nonexistent-package', 'has-package', 'no-package');
  expect(result).toBe('no-package');
});

test('ifAnyDep handles array of dependencies', () => {
  const result = ifAnyDep(['vitest', 'nonexistent'], 'found', 'not-found');
  expect(result).toBe('found');
});

test('ifAnyDep works with objects as return values', () => {
  const trueValue = { rules: { 'test-rule': 'error' } };
  const falseValue = {};

  const result = ifAnyDep('vitest', trueValue, falseValue);
  expect(result).toEqual(trueValue);
});

test('hasAnyDep detects existing dependencies', () => {
  // vitest is in devDependencies
  expect(hasAnyDep('vitest')).toBe(true);
});

test('hasAnyDep returns false for non-existent dependencies', () => {
  expect(hasAnyDep('nonexistent-package')).toBe(false);
});

test('hasAnyDep handles array of dependencies', () => {
  expect(hasAnyDep(['vitest', 'nonexistent'])).toBe(true);
  expect(hasAnyDep(['nonexistent-1', 'nonexistent-2'])).toBe(false);
});

test('hasDep checks only production dependencies', () => {
  // vitest is in devDependencies, not dependencies, so should be false
  expect(hasDep('vitest')).toBe(false);

  // Check a real production dependency
  expect(hasDep('prettier')).toBe(true);
});

test('hasLocalConfig returns boolean value', async () => {
  const { cosmiconfigSync } = await import('cosmiconfig');
  const mockExplorer = {
    search: vi.fn().mockReturnValue({ config: {} }),
  };
  vi.mocked(cosmiconfigSync).mockReturnValue(mockExplorer);

  const result = hasLocalConfig('prettier');
  expect(typeof result).toBe('boolean');
  expect(result).toBe(true);
});

test('hasLocalConfig returns false when no config found', async () => {
  const { cosmiconfigSync } = await import('cosmiconfig');
  const mockExplorer = {
    search: vi.fn().mockReturnValue(null),
  };
  vi.mocked(cosmiconfigSync).mockReturnValue(mockExplorer);

  const result = hasLocalConfig('some-fake-config');
  expect(result).toBe(false);
});

test('hasLocalConfig accepts search options', async () => {
  const { cosmiconfigSync } = await import('cosmiconfig');
  const mockExplorer = {
    search: vi.fn().mockReturnValue(null),
  };
  vi.mocked(cosmiconfigSync).mockReturnValue(mockExplorer);

  const options = { stopDir: process.cwd() };
  hasLocalConfig('eslint', options);
  expect(cosmiconfigSync).toHaveBeenCalledWith('eslint', options);
});
