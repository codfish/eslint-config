import { defineConfig } from 'eslint/config';
import globals from 'globals';

import codfish from './index.js';

export default defineConfig(
  codfish,

  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
);
