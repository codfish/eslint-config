import { afterEach, beforeEach, expect, test } from 'vitest';

import config from '../../index.js';

beforeEach(() => {
  // Setup before each test
});

afterEach(() => {
  // Cleanup after each test
});

test('includes React configuration when React is detected', () => {
  // Check if React-related configuration is present
  // Since we have react in dependencies, React config should be included
  const hasReactConfig = config.some(item => item.name && item.name.includes('react'));

  // React configuration should be present if react is installed
  const hasReactRules = config.some(
    item => item.rules && Object.keys(item.rules).some(rule => rule.startsWith('react/')),
  );

  // At minimum, we should have some React-related configuration
  expect(hasReactConfig || hasReactRules).toBe(true);
});

test('includes Vitest configuration when Vitest is detected', () => {
  // Since vitest is in devDependencies, vitest config should be included
  const hasVitestConfig = config.some(item => item.name === 'codfish/vitest');

  expect(hasVitestConfig).toBe(true);
});

test('always includes base configurations regardless of dependencies', () => {
  const configNames = config.filter(item => item.name).map(item => item.name);

  // These should always be present
  expect(configNames).toContain('codfish/base');
  expect(configNames).toContain('codfish/ignores');
  expect(configNames).toContain('codfish/config-files');
});

test('always includes YAML configuration', () => {
  // YAML should always be included
  const hasYamlRules = config.some(item => item.rules && Object.keys(item.rules).some(rule => rule.startsWith('yml/')));
  expect(hasYamlRules).toBe(true);
});

test('includes prettier configuration as last item', () => {
  const lastConfig = config[config.length - 1];
  expect(lastConfig.rules?.['prettier/prettier']).toBeDefined();
});

test('config structure is valid for ESLint flat config', () => {
  // Each config item should be a valid flat config object
  config.forEach(configItem => {
    expect(configItem).toBeTypeOf('object');
    expect(configItem).not.toBeNull();

    // Should have at least one valid flat config property
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

test('no duplicate configuration names', () => {
  const names = config.filter(item => item.name).map(item => item.name);

  const uniqueNames = new Set(names);
  expect(uniqueNames.size).toBe(names.length);
});
