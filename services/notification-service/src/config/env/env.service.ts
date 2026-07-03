import { Injectable } from '@nestjs/common';

import { envSchema, EnvVars } from './env.schema';

/**
 * Acceso tipado a las variables de entorno, validadas contra `envSchema`
 * (Zod) al arrancar el servicio.
 *
 * @remarks
 * La validación ocurre una sola vez en el constructor: si falta una
 * variable requerida o tiene un formato inválido, el servicio falla al
 * levantar (fail-fast) en lugar de fallar más tarde en tiempo de uso con
 * un valor `undefined` o mal tipado.
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
   * Obtiene el valor ya parseado y tipado de una variable de entorno.
   *
   * @param key - Nombre de la variable, debe existir en `EnvVars`.
   * @returns El valor con el tipo que infiere `envSchema` (incluye defaults
   * aplicados por Zod cuando la variable no vino definida).
   */
  get<T extends keyof EnvVars>(key: T): EnvVars[T] {
    return this.env[key];
  }
}
