import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  testMatch: [
  '**/__tests__/**/*.spec.ts',
],

  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  /* ───────────────────────────────
     Alias de paths (CLAVE)
     ─────────────────────────────── */

  moduleNameMapper: {
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
  },

  /* ───────────────────────────────
     Coverage
     ─────────────────────────────── */

  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/**/*.enum.ts',
    '!src/**/*.type.ts',
    '!src/**/*.interface.ts',
    '!src/**/index.ts',
    '!src/**/main.ts',
    '!src/**/infrastructure/**',
    '!src/**/__tests__/**',
  ],

  coverageReporters: ['text', 'lcov', 'json-summary'],

  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
};

export default config;
