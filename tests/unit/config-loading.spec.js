import { expect, test } from 'vitest';

import config from '../../index.js';

test('loads without errors', () => {
  expect(() => config).not.toThrow();
});

test('exports valid flat config array', () => {
  expect(Array.isArray(config)).toBe(true);
  expect(config.length).toBeGreaterThan(0);
});

test('all config objects have valid structure', () => {
  config.forEach(configItem => {
    expect(configItem).toBeTypeOf('object');
    expect(configItem).not.toBeNull();

    // Each config should have at least one of these properties
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

test('config objects have unique names when specified', () => {
  const names = config.filter(item => item.name).map(item => item.name);

  const uniqueNames = new Set(names);
  expect(uniqueNames.size).toBe(names.length);
});

test('contains expected core configurations', () => {
  const configNames = config.filter(item => item.name).map(item => item.name);

  // Should contain our main configuration blocks
  expect(configNames).toContain('codfish/base');
  expect(configNames).toContain('codfish/ignores');
  expect(configNames).toContain('codfish/config-files');
});

test('contains YAML configuration', () => {
  // YAML configs don't have names, so check for yml-related rules
  const hasYamlRules = config.some(item => item.rules && Object.keys(item.rules).some(rule => rule.startsWith('yml/')));
  expect(hasYamlRules).toBe(true);
});

test('ends with prettier configuration', () => {
  const lastConfig = config[config.length - 1];
  expect(lastConfig.rules).toBeDefined();
  expect(lastConfig.rules?.['prettier/prettier']).toBeDefined();
});
