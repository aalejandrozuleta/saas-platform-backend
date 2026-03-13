import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import prettierConfig from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/.next/**',
      '**/coverage/**',
      '**/lcov-report/**',
      '**/*.d.ts',
    ],
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },

  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.base.json',
        tsconfigRootDir: process.cwd(),
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
        },
      ],
      'import/no-duplicates': 'error',
      'import/newline-after-import': ['error', { count: 1 }],

      'unused-imports/no-unused-imports': 'error',

      curly: ['error', 'all'],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-implicit-coercion': 'error',
      'no-var': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-const': ['error', { destructuring: 'all' }],
    },
  },

  {
    files: ['**/*.ts'],
    plugins: {
      boundaries: boundaries,
    },
    settings: {
      'boundaries/elements': [
        { type: 'domain', pattern: 'services/*/src/domain/**' },
        { type: 'application', pattern: 'services/*/src/application/**' },
        { type: 'infrastructure', pattern: 'services/*/src/infrastructure/**' },
        { type: 'modules', pattern: 'services/*/src/modules/**' },
        { type: 'shared', pattern: 'shared/**' },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'domain', allow: [] },
            { from: 'application', allow: ['domain'] },
            { from: 'infrastructure', allow: ['application', 'domain'] },
            { from: 'modules', allow: ['infrastructure'] },
            { from: 'shared', allow: [] },
          ],
        },
      ],
    },
  },

  /*
   TEST FILES
   relajamos reglas para tests
  */
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': 'off',
    },
  },

  /*
   SHARED PACKAGE
   utilidades compartidas pueden usar any
  */
  {
    files: ['shared/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  prettierConfig,
];