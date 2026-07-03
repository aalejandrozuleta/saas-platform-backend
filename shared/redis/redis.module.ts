import { DynamicModule, Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS_CLIENT } from './redis.constants';
import { RedisModuleOptions } from './redis.types';

/**
 * Opciones para registrar `RedisModule` de forma asíncrona, siguiendo el
 * patrón estándar de NestJS (`imports`/`inject`/`useFactory`) cuando la
 * configuración de conexión depende de otro provider (por ejemplo,
 * `ConfigService`).
 */
export interface RedisModuleAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (...args: any[]) => RedisModuleOptions;
}

/**
 * Módulo global que provee un cliente Redis (`ioredis`) compartido bajo el
 * token `REDIS_CLIENT`. Al ser `@Global()`, basta con importarlo una vez
 * (típicamente en el módulo raíz del servicio) para poder inyectar
 * `REDIS_CLIENT` en cualquier otro módulo.
 */
@Global()
@Module({})
export class RedisModule {
  /**
   * Registra el módulo de forma síncrona con opciones de conexión fijas.
   *
   * @param options - Host, puerto y password de Redis.
   * @returns El `DynamicModule` a importar en el módulo raíz del servicio.
   */
  static forRoot(options: RedisModuleOptions): DynamicModule {
    const provider = {
      provide: REDIS_CLIENT,
      useFactory: () => {
        return new Redis({
          host: options.host,
          port: options.port,
          password: options.password,
          lazyConnect: true,
          maxRetriesPerRequest: 3,
        });
      },
    };

    return {
      module: RedisModule,
      providers: [provider],
      exports: [provider],
    };
  }

  /**
   * Registra el módulo de forma asíncrona, resolviendo las opciones de
   * conexión mediante una factory (por ejemplo, a partir de variables de
   * entorno vía `ConfigService`). A diferencia de `forRoot`, habilita
   * `enableReadyCheck` y una estrategia de reintento con backoff.
   *
   * @param options - Imports, dependencias a inyectar y factory que
   *   produce las `RedisModuleOptions`.
   * @returns El `DynamicModule` a importar en el módulo raíz del servicio.
   */
  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    const provider = {
      provide: REDIS_CLIENT,
      inject: options.inject ?? [],
      useFactory: (...args: any[]) => {
        const config = options.useFactory(...args);

        return new Redis({
          host: config.host,
          port: config.port,
          password: config.password,
          lazyConnect: true,
          enableReadyCheck: true,
          maxRetriesPerRequest: 3,
          retryStrategy: (times: number) => Math.min(times * 50, 2000),
        });
      },
    };

    return {
      module: RedisModule,
      imports: options.imports ?? [],
      providers: [provider],
      exports: [provider],
    };
  }
}
