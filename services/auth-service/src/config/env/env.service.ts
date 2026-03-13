import { Injectable } from '@nestjs/common';

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
      const error = new Error(`Error en variables de entorno`);
      (error as any).cause = parsed.error;
      throw error;
    }

    this.env = parsed.data;
  }

  get<T extends keyof EnvVars>(key: T): EnvVars[T] {
    return this.env[key];
  }
}
