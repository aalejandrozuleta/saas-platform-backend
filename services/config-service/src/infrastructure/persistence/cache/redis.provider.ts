import Redis from 'ioredis';
import { EnvService } from '@config/env/env.service';
import { REDIS_CLIENT } from '@saas/shared';

/**
 * Provider de NestJS para el cliente de Redis (`ioredis`).
 * La contraseña (`REDIS_PASSWORD`) es obligatoria: `envSchema` exige un
 * mínimo de 16 caracteres, por lo que Redis siempre se conecta con auth
 * habilitada (ver hardening de seguridad de Redis).
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
