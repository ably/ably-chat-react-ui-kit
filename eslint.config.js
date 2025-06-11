// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: ['./tsconfig.json'],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@typescript-eslint': typescriptPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React rules
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript rules
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-extraneous-class': [
        'error',
        {
          allowStaticOnly: true,
        },
      ],

      // TypeScript naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'memberLike',
          format: ['camelCase'],
          modifiers: ['private'],
          leadingUnderscore: 'require',
        },
        {
          selector: 'enumMember',
          format: ['PascalCase'],
        },
        {
          selector: 'memberLike',
          format: ['camelCase'],
          modifiers: ['public', 'protected'],
          leadingUnderscore: 'forbid',
        },
        {
          selector: 'objectLiteralProperty',
          filter: {
            regex: '(ably-|-ably-|chat-|-chat-)',
            match: true,
          },
          format: null,
        },
      ],

      // General rules from your other repo
      'eol-last': 'error',
      'no-redeclare': 'off',
      'no-undef': 'off',
      'no-dupe-class-members': 'off',
      'require-await': 'off',

      // General rules (keeping existing ones)
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],

      // Prettier rules
      'prettier/prettier': 'error',
    },
  },
  // Test files configuration
  {
    files: ['test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
  prettierConfig,
  ...storybook.configs['flat/recommended'],
];
