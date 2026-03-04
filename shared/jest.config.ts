import type { Config } from 'jest';

import baseConfig from '../jest.config.base.ts';

/**
 * Configuración Jest específica del auth-service.
 */
const config: Config = {
  ...baseConfig,

  // Importante: raíz del servicio
  rootDir: '.',

  // Nombre visible en logs / CI
  displayName: 'shared',

  roots: ['<rootDir>'],

  // Setup específico si luego lo necesitas
  setupFilesAfterEnv: [],

  testMatch: ['**/*.spec.ts'],

  collectCoverageFrom: [
  '**/*.ts',

  '!**/*.spec.ts',
  '!**/*.test.ts',
  '!**/__tests__/**',

  '!jest.config.ts',
  '!../jest.config.base.ts'
],


  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/index.ts',

    String.raw`\.spec\.ts$`,
    String.raw`\.test\.ts$`,
    '/__tests__/',

    '/application/dto/',

    '/domain/repositories/',
    '/domain/token/',
    '/modules/',
    String.raw`\.module\.ts$`,
    String.raw`\.providers\.ts$`,

    'main.ts',
  ],


  moduleNameMapper: {
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
  },

  testPathIgnorePatterns: [
    '/node_modules/',
    '\\.int\\.spec\\.ts$',
  ],
};

export default config;
