import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { SessionCache } from '@application/ports/session-cache.port';

import { REDIS_CLIENT } from './redis.provider';

/**
 * Implementación Redis del cache de sesiones.
 *
 * Permite validar sesiones rápidamente
 * sin consultar PostgreSQL.
 */
@Injectable()
export class RedisSessionCacheService implements SessionCache {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  private buildKey(sessionId: string): string {
    return `session:${sessionId}`;
  }

  async storeSession(
    sessionId: string,
    userId: string,
    deviceId: string | null,
    ttl: number,
  ): Promise<void> {
    const key = this.buildKey(sessionId);

    await this.redis.set(
      key,
      JSON.stringify({
        userId,
        deviceId,
        revoked: false,
      }),
      'EX',
      ttl,
    );
  }

  async isSessionActive(sessionId: string): Promise<boolean> {
    const key = this.buildKey(sessionId);

    const value = await this.redis.get(key);

    return value !== null;
  }

  async revokeSession(sessionId: string): Promise<void> {
    const key = this.buildKey(sessionId);

    await this.redis.del(key);
  }
}