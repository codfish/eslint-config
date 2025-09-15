import { defineConfig } from 'eslint/config';

export default defineConfig({
  name: 'codfish/dapp',

  files: ['**/contracts/**/*.{js,ts}', '**/migrations/**/*.{js,ts}', '**/truffle/**/*.{js,ts}'],

  languageOptions: {
    globals: {
      artifacts: 'readonly',
      assert: 'readonly',
      contract: 'readonly',
      deployer: 'readonly',
      web3: 'readonly',
    },
  },
});
