import { Injectable } from '@nestjs/common';

import { envSchema, EnvVars } from './env.schema';

@Injectable()
export class EnvService {
  private readonly env: EnvVars;

  constructor() {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
      throw new Error(`Error en variables de entorno: ${parsed.error.message}`);
    }

    this.env = parsed.data;
  }

  get<T extends keyof EnvVars>(key: T): EnvVars[T] {
    return this.env[key];
  }
}
