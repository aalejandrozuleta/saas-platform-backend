import { Global, Module } from '@nestjs/common';

import { redisProvider } from './redis.provider';

/**
 * Módulo global que expone el cliente de Redis (`REDIS_CLIENT`) al resto
 * de la aplicación, usado principalmente por `RedisConfigCacheService`.
 * Es `@Global()` para no tener que reimportarlo en cada módulo consumidor.
 */
@Global()
@Module({
  providers: [redisProvider],
  exports: [redisProvider],
})
export class RedisModule {}
