import { Injectable } from '@nestjs/common';
import { logger } from '@shared/logger';
import { envSchema, type EnvVars } from './env.schema';

/**
 * Servicio centralizado de variables de entorno.
 * Todas las variables están validadas en el arranque.
 */
@Injectable()
export class EnvService {
  private readonly env: EnvVars;

  constructor() {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
      logger.error(
        'Invalid environment configuration',
        parsed.error.format(),
      );

      // Permite flush del logger antes de salir
      process.exitCode = 1;
      throw new Error('Environment validation failed');
    }

    this.env = parsed.data;
  }

  /**
   * Obtiene una variable de entorno validada.
   */
  get<T extends keyof EnvVars>(key: T): EnvVars[T] {
    return this.env[key];
  }
}
