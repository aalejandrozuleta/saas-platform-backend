import { Injectable } from '@nestjs/common';
import z from 'zod';

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
      z.treeifyError(parsed.error);
      throw new Error('Environment validation failed');
    }

    this.env = parsed.data;
  }

  get<T extends keyof EnvVars>(key: T): EnvVars[T] {
    return this.env[key];
  }
}
