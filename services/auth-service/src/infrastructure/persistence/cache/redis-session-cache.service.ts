import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { SessionCache, SessionData } from '@application/ports/session-cache.port';

import { REDIS_CLIENT } from './redis.provider';

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
    sessionId:   string,
    userId:      string,
    deviceId:    string | null,
    ttl:         number,
    role:        string = '',
    permissions: string[] = [],
  ): Promise<void> {
    await this.redis.set(
      this.buildKey(sessionId),
      JSON.stringify({ userId, deviceId, role, permissions }),
      'EX',
      ttl,
    );
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const raw = await this.redis.get(this.buildKey(sessionId));
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<SessionData & { deviceId?: string }>;
      return {
        userId:      parsed.userId      ?? '',
        role:        parsed.role        ?? '',
        permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
      };
    } catch {
      return null;
    }
  }

  async isSessionActive(sessionId: string): Promise<boolean> {
    return (await this.redis.get(this.buildKey(sessionId))) !== null;
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.redis.del(this.buildKey(sessionId));
  }
}