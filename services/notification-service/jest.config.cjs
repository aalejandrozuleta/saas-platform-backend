const base = require('../../jest.config.base.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...base,

  displayName: 'notification-service',
  rootDir: '.',

  moduleNameMapper: {
    '^@saas/shared$': '<rootDir>/../../shared/index.ts',
    '^@saas/shared/(.*)$': '<rootDir>/../../shared/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
  },

  roots: ['<rootDir>/src'],

  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },

  transformIgnorePatterns: [
    'node_modules/(?!(?:@saas/shared)/)',
  ],
};
