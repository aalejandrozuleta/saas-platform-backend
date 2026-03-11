import { Global, Module } from '@nestjs/common';

import { redisProvider } from './redis.provider';

/**
 * Módulo global de Redis.
 */
@Global()
@Module({
  providers: [redisProvider],
  exports: [redisProvider],
})
export class RedisModule {}