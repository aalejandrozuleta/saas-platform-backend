import { Injectable } from '@nestjs/common';

import { envSchema, EnvVars } from './env.schema';

/**
 * Servicio centralizado de acceso a variables de entorno validadas con Zod.
 *
 * @remarks
 * La validación ocurre una sola vez en el constructor: si `process.env` no
 * cumple `envSchema`, el proceso falla al arrancar en vez de fallar más
 * tarde de forma impredecible cuando falte una variable en tiempo de uso.
 */
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

  /**
   * Obtiene una variable de entorno ya validada y tipada.
   *
   * @param key - Nombre de la variable (clave de `EnvVars`)
   */
  get<T extends keyof EnvVars>(key: T): EnvVars[T] {
    return this.env[key];
  }
}
