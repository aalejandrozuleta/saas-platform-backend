import Redis from 'ioredis';
import { EnvService } from '@config/env/env.service';

/**
 * Token de inyección para Redis.
 */
export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

/**
 * Provider que crea la conexión Redis.
 */
export const redisProvider = {
  provide: REDIS_CLIENT,
  inject: [EnvService],
  useFactory: (envService: EnvService) => {
    return new Redis({
      host: envService.get('REDIS_HOST'),
      port: Number(envService.get('REDIS_PORT')),
      password: envService.get('REDIS_PASSWORD'),
    });
  },
};