import { hasAnyDep } from '../utils.js';

/**
 * TypeScript ESLint configuration. Dynamically loads typescript-eslint
 * only when typescript is installed in the consuming project.
 *
 * - https://typescript-eslint.io/
 */
const hasTypeScript = hasAnyDep('typescript');
const tseslintConfig =
  /** @type {import('eslint').Linter.Config[]} */
  (hasTypeScript ? [(await import('typescript-eslint')).default.configs.recommended] : []);

export default tseslintConfig;

export const rules = hasTypeScript
  ? {
      // Allows destructuring of rest properties even if they are unused
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['interface', 'typeAlias'],
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]', // prevent prefixing interfaces and type alias declarations with "I"
            match: false,
          },
        },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          // If you need to use a ts comment, make sure you have a description.
          'ts-ignore': 'allow-with-description',
          'ts-expect-error': 'allow-with-description',
          'ts-nocheck': 'allow-with-description',
        },
      ],

      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            'React.FC': {
              message: 'Useless and has some drawbacks, see https://github.com/facebook/create-react-app/pull/8177',
            },
            'React.FunctionComponent': {
              message: 'Useless and has some drawbacks, see https://github.com/facebook/create-react-app/pull/8177',
            },
          },
        },
      ],
    }
  : {};
