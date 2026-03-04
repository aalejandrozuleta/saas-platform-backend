/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',

  transform: {
    '^.+\\.(t|j)s$': [
      '@swc/jest',
      {
        jsc: {
          target: 'es2022',
          parser: {
            syntax: 'typescript',
            decorators: true
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true
          }
        }
      }
    ]
    
  },

  moduleFileExtensions: ['ts', 'js', 'json'],

  coverageReporters: ['text', 'lcov', 'json-summary'],

  maxWorkers: '50%',

  cacheDirectory: '.jest-cache',

  clearMocks: true
};