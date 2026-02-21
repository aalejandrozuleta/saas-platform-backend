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
      console.error('Error validando variables de entorno:', parsed.error);
      process.exit(1);
    }

    this.env = parsed.data;
  }

  get<T extends keyof EnvVars>(key: T): EnvVars[T] {
    return this.env[key];
  }
}
