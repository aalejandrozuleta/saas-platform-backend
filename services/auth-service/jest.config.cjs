const base = require('../../jest.config.base.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...base,

  displayName: 'auth-service',
  rootDir: '.',


  moduleNameMapper: {
    '^@saas/shared$': '<rootDir>/../../shared/index.ts',
    '^@saas/shared/(.*)$': '<rootDir>/../../shared/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',

    '^@prisma$': '<rootDir>/generated/prisma',
  },

  roots: ['<rootDir>/src'],
  
  transformIgnorePatterns: [
  'node_modules/(?!(?:@saas/shared)/)',
],
};
