import { Injectable } from '@nestjs/common';
import { logger } from '@saas/shared';

import { envSchema, EnvVars } from './env.schema';

/**
 * Servicio centralizado de acceso a variables de entorno
 * validadas con Zod.
 */
@Injectable()
export class EnvService {
  private readonly env: EnvVars;

  constructor() {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
      logger.error('Invalid environment configuration', {
        errors: parsed.error,
      });
      process.exit(1);
    }

    this.env = parsed.data;
  }

  get<T extends keyof EnvVars>(key: T): EnvVars[T] {
    return this.env[key];
  }
}
