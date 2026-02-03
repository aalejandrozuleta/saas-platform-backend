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
};

export default config;
