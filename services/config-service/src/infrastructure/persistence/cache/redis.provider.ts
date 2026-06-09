import Redis from 'ioredis';
import { EnvService } from '@config/env/env.service';
import { REDIS_CLIENT } from '@saas/shared';

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
