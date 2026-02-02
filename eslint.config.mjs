import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import prettierConfig from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';

export default [
  /**
   * Configuración base TypeScript
   */
  {
    files: ['**/*.ts'],
    ignores: ['**/dist/**', '**/node_modules/**'],
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

      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],

      'unused-imports/no-unused-imports': 'error',

      'no-console': 'warn',
      'no-debugger': 'error',
    },
  },

  /**
   * Reglas de arquitectura
   */
  {
    files: ['**/*.ts'],
    plugins: {
      boundaries,
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

  /**
   * Prettier (siempre al final)
   */
  prettierConfig,
];
