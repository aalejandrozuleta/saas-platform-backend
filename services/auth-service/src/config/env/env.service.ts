import { logger } from '@saas/shared';

import { envSchema, EnvVars } from './env.schema';

/**
 * Servicio centralizado de acceso a variables de entorno.
 */
export class EnvService {
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
