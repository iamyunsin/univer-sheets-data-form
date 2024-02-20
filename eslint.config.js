import antfu from '@antfu/eslint-config';
import header from 'eslint-plugin-header';
import tsParser from '@typescript-eslint/parser';

export default antfu({
  stylistic: {
    indent: 2,
    semi: true,
  },
  react: true,
  yaml: {
    overrides: {
      'yaml/indent': ['error', 2, { indicatorValueIndent: 2 }],
    },
  },
  markdown: false,
  formatters: {
    css: true,
    html: true,
        // markdown: 'prettier'
  },
  rules: {
    curly: ['error', 'multi-line'],
    'import/no-cycle': 'error',
    'ts/no-explicit-any': 'warn',
    'style/brace-style': ['warn', '1tbs', { allowSingleLine: true }],
    'style/comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      enums: 'always-multiline',
      functions: 'never',
    }],
    'style/arrow-parens': ['error', 'always'],
    'ts/no-redeclare': 'off',
    'antfu/if-newline': 'off',
    'style/spaced-comment': 'off',
    'tunicorn/number-literal-case': 'off',
    'style/indent-binary-ops': 'off',
    'ts/method-signature-style': 'off',
    'style/indent': ['error', 2, {
      ObjectExpression: 'first',
      SwitchCase: 1,
      ignoreComments: true,
    }],
    'sort-imports': [
      'error',
      {
        allowSeparatedGroups: false,
                //   ignoreCase: false,
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      },
    ],

        // TODO: debatable rules
    'test/prefer-lowercase-title': 'off',
    'antfu/top-level-function': 'off',
    'style/operator-linebreak': 'off',
    'unicorn/no-new-array': 'off',
    'unicorn/prefer-includes': 'off',
    'prefer-arrow-callback': 'off',
    'no-restricted-globals': 'off',
    'unicorn/prefer-string-starts-ends-with': 'warn',

        // TODO: just for compatibility with old code
    'unused-imports/no-unused-vars': 'warn',
    'style/jsx-closing-tag-location': 'warn',
    'ts/ban-types': 'warn',
    'unicorn/prefer-dom-node-text-content': 'warn',
    'unicorn/prefer-number-properties': 'warn',
    'no-prototype-builtins': 'warn',
    'style/no-tabs': 'warn',
    'style/quotes': ['warn', 'single', { avoidEscape: true }],

    'react-refresh/only-export-components': 'off',
    'react/display-name': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'eslint-comments/no-unlimited-disable': 'off',
    'ts/prefer-ts-expect-error': 'off',
    'ts/ban-ts-comment': 'off',
    'ts/no-duplicate-enum-values': 'off',
    'no-cond-assign': 'warn',
    'antfu/consistent-list-newline': 'off',
    'ts/no-use-before-define': 'off',
    'intunicorn/number-literal-case': 'off',
    'test/no-identical-title': 'warn',
    'ts/no-non-null-asserted-optional-chain': 'warn',
    'no-restricted-syntax': 'warn',
    'prefer-regex-literals': 'warn',
    'ts/no-this-alias': 'warn',
    'prefer-promise-reject-errors': 'warn',
    'no-new': 'warn',
    'unicorn/error-message': 'warn',
    'ts/prefer-literal-enum-member': 'warn',
    'style/jsx-curly-newline': ['warn', { multiline: 'forbid', singleline: 'forbid' }],
    'no-control-regex': 'warn',
    'style/jsx-wrap-multilines': 'warn',
    'ts/no-import-type-side-effects': 'warn',
    'style/quote-props': ['warn', 'as-needed'],
    'unicorn/number-literal-case': 'warn',
    'react/no-direct-mutation-state': 'warn',
    'style/jsx-curly-brace-presence': 'warn',
    'style/multiline-ternary': 'warn',
    'unicorn/prefer-type-error': 'warn',
    'accessor-pairs': 'warn',
  },
}, {
  files: ['**/*.ts', '**/*.tsx'],
  ignores: ['**/*.d.ts', '**/vite.config.ts', 'playwright.config.ts'],
  plugins: {
    header,
  },
  rules: {
    'header/header': [
      2,
      'block',
      [
        '*',
        ' * Copyright 2024-present iamyunsin',
        ' *',
        ' * Licensed under the Apache License, Version 2.0 (the "License");',
        ' * you may not use this file except in compliance with the License.',
        ' * You may obtain a copy of the License at',
        ' *',
        ' *     http://www.apache.org/licenses/LICENSE-2.0',
        ' *',
        ' * Unless required by applicable law or agreed to in writing, software',
        ' * distributed under the License is distributed on an "AS IS" BASIS,',
        ' * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.',
        ' * See the License for the specific language governing permissions and',
        ' * limitations under the License.',
        ' ',
      ],
      2,
    ],
  },
}, {
  files: ['**/*.ts', '**/*.tsx'],
  rules: {
    'ts/naming-convention': [
      'warn',
            // Interfaces' names should start with a capital 'I'.
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z0-9]',
          match: true,
        },
      },
            // Private fields of a class should start with an underscore '_'.
      {
        selector: ['classMethod', 'classProperty'],
        modifiers: ['private'],
        format: ['camelCase'],
        leadingUnderscore: 'require',
      },
    ],
  },
  languageOptions: {
    parser: tsParser,
  },
});
