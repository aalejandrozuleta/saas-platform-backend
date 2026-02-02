import { logger } from '@shared/logger';

import { envSchema, type EnvVars } from './env.schema';


/**
 * Servicio de acceso a variables de entorno ya validadas.
 * Nunca usar process.env fuera de aquí.
 */
class EnvService {
  private readonly env: EnvVars;

  constructor() {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
      logger.error('Invalid environment configuration');
      process.exit(1);
    }

    this.env = parsed.data;
  }

  get<T extends keyof EnvVars>(key: T): EnvVars[T] {
    return this.env[key];
  }
}

export const envService = new EnvService();
