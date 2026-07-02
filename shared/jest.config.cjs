const base = require('../jest.config.base.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...base,

  displayName: 'auth-shared',
  rootDir: '.',

  roots: ['<rootDir>'],

  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.spec.ts',
    '!**/*.d.ts',
    '!**/dist/**',
    '!**/node_modules/**',
    '!**/*.module.ts',
    '!**/index.ts',
    '!**/*.interface.ts',
    '!**/*.types.ts',
    '!**/*.tokens.ts',
    '!**/*.schema.ts',
    '!**/*.constants.ts',
  ],

  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};
