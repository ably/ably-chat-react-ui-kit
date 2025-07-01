// eslint.config.js  –  Flat-config style, ESM
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

import tsParser from '@typescript-eslint/parser';
import typescriptEslint from '@typescript-eslint/eslint-plugin';

import _import from 'eslint-plugin-import';
import security from 'eslint-plugin-security';
import pluginCompat from 'eslint-plugin-compat';
import unicorn from 'eslint-plugin-unicorn';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import jsdoc from 'eslint-plugin-jsdoc';

import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig:        js.configs.all,
});

export default [
  /* -----------------------------------------------------------
   * 1. Global ignores
   * --------------------------------------------------------- */
  {
    ignores: [
      '**/eslint.config.js',
      '**/dist',
      '**/node_modules',
      '**/ably-common',
      '**/typedoc',
      '**/vitest.config.ts',
      '**/vite.config.ts',
      '**/coverage/',
      './src/setup.ts',
      '.storybook',
      '.github',
      './src/stories',
    ],
  },

  /* -----------------------------------------------------------
   * 2. Global rule sets (apply to every file that is *not* ignored)
   * --------------------------------------------------------- */
  unicorn.configs.recommended,

  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended-type-checked',
      'plugin:@typescript-eslint/strict-type-checked',
      'plugin:@typescript-eslint/stylistic-type-checked',
      'plugin:security/recommended-legacy',
      'plugin:import/recommended',
      'plugin:compat/recommended',
      'plugin:node/recommended',
    ),
  ),

  {
    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      import:               fixupPluginRules(_import),
      security:             fixupPluginRules(security),
      pluginCompat:         fixupPluginRules(pluginCompat),
      'simple-import-sort': simpleImportSort,
      jsdoc,
    },

    languageOptions: {
      parser:       tsParser,
      ecmaVersion:  2023,
      sourceType:   'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parserOptions: { project: ['./tsconfig.json'] },
    },

    settings: {
      jsdoc: { tagNamePreference: { default: 'defaultValue' } },
    },

    rules: {
      /* --- stylistic / miscellaneous ---------------------------------- */
      'eol-last':                'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      /* --- overrides / disables --------------------------------------- */
      'security/detect-object-injection': 'off',
      'no-redeclare':                    'off',
      'node/no-missing-import':          'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',

      /* --- naming convention ------------------------------------------ */
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'typeLike',            format: ['PascalCase'] },
        { selector: 'enumMember',          format: ['PascalCase'] },
        { selector: 'memberLike',          format: ['camelCase'], modifiers: ['private'],   leadingUnderscore: 'require' },
        { selector: 'memberLike',          format: ['camelCase'], modifiers: ['public','protected'], leadingUnderscore: 'forbid' },
        { selector: 'objectLiteralProperty',
          filter: { regex: '(ably-|-ably-|chat-|-chat-)', match: true },
          format: null,
        },
      ],
    },
  },

  /* -----------------------------------------------------------
   * 3. TypeScript-specific tweaks (all .ts / .tsx)
   * --------------------------------------------------------- */
  {
    files: ['src/**/*.{ts,tsx}'],

    rules: {
      '@typescript-eslint/no-unused-vars':             'error',
      '@typescript-eslint/no-extraneous-class':       ['error', { allowStaticOnly: true }],
      'import/no-unresolved':                          'off',
      'no-undef':                                      'off',
      'no-dupe-class-members':                         'off',
      'require-await':                                 'off',
      'unicorn/prevent-abbreviations':                 'off',
      'unicorn/numeric-separators-style':              'off',
      'unicorn/prefer-event-target':                   'off',
      'unicorn/no-static-only-class':                  'off',
      'unicorn/no-nested-ternary':                     'off',

      'import/extensions': ['error', 'always', { ignorePackages: true }],
    },
  },

  /* -----------------------------------------------------------
   * 4. Test files (all .ts / .tsx)
   * --------------------------------------------------------- */

  {
    files: ['src/test/**/*.{ts,tsx}'],

    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'unicorn/no-null': 'off',
      'react/react-in-jsx-scope': 'off',
      'node/no-unpublished-import': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/prefer-ternary': 'off',
    },
  },

  /* -----------------------------------------------------------
   * 5. React & React-Hooks
   * --------------------------------------------------------- */
  ...fixupConfigRules(
    compat.extends('plugin:react/recommended', 'plugin:react-hooks/recommended'),
  ).map((cfg) => ({
    ...cfg,
    files: ['src/**/*.{tsx,ts}'],
  })),

  {
    files: ['src/**/*.{tsx,ts}'],
    plugins: {
      react:        fixupPluginRules(react),
      'react-hooks': fixupPluginRules(reactHooks),
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];