const base = require('../../jest.config.base.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...base,

  displayName: 'api-gateway',
  rootDir: '.',

  moduleNameMapper: {
    '^@saas/shared$': '<rootDir>/../../shared/index.ts',
    '^@saas/shared/(.*)$': '<rootDir>/../../shared/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
  },

  roots: ['<rootDir>/src'],

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/**/*.d.ts',
  ],

  transformIgnorePatterns: [
    'node_modules/(?!(?:@saas/shared)/)',
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
