import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '@saas/shared';
import type { Redis } from 'ioredis';
import type { ConfigCache } from '@application/ports/config-cache.port';

/**
 * Implementación Redis del puerto de caché de configuraciones.
 *
 * @remarks
 * Las claves se prefijan con `config-service:` para no colisionar con
 * otros servicios que compartan la misma instancia Redis.
 */
@Injectable()
export class RedisConfigCacheService implements ConfigCache {
  private readonly NS = 'config-service';

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async get(key: string): Promise<string | null> {
    return this.redis.get(`${this.NS}:${key}`);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(`${this.NS}:${key}`, value, 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(`${this.NS}:${key}`);
  }

  async flush(pattern: string): Promise<void> {
    const keys = await this.redis.keys(`${this.NS}:${pattern}`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
