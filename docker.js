import { defineConfig } from 'eslint/config';

/**
 * Turns off `import/no-unresolved` errors for node modules in projects using
 * Docker, to avoid false positives.
 */
export default defineConfig({
  name: 'codfish/docker',

  rules: {
    'import/no-unresolved': ['error', { ignore: ['^[^.]+'] }],
  },
});
