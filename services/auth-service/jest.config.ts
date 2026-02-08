import type { Config } from 'jest';

import baseConfig from '../../jest.config.base.ts';

/**
 * Configuración Jest específica del auth-service.
 */
const config: Config = {
  ...baseConfig,

  // Importante: raíz del servicio
  rootDir: '.',

  // Nombre visible en logs / CI
  displayName: 'auth-service',

  roots: ['<rootDir>/src'],

  // Setup específico si luego lo necesitas
  setupFilesAfterEnv: [],

  testMatch: ['**/*.spec.ts'],

  collectCoverageFrom: [
    'src/**/*.ts',

    // ⛔️ excluir tests
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**',
  ],


  coveragePathIgnorePatterns: [
    '/node_modules/',

    // tests
    String.raw`\.spec\.ts$`,
    String.raw`\.test\.ts$`,
    '/__tests__/',

    // DTOs
    '/application/dto/',

    // Contracts & wiring
    '/domain/repositories/',
    '/domain/token/',
    '/modules/',
    String.raw`\.module\.ts$`,
    String.raw`\.providers\.ts$`,

    // Config & bootstrap
    '/config/',
    'main.ts',
  ],


  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',

    '^@prisma$': '<rootDir>/generated/prisma',
  },
};

export default config;
