import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { SessionCache, SessionData } from '@application/ports/session-cache.port';

import { REDIS_CLIENT } from './redis.provider';

/**
 * Cache de sesiones en Redis.
 *
 * Implementa {@link SessionCache}. Guarda una copia liviana de la sesión
 * (userId, deviceId, role, permissions) con expiración (TTL) para
 * validar sesiones sin golpear la base de datos en cada request.
 */
@Injectable()
export class RedisSessionCacheService implements SessionCache {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  /**
   * Construye la key de Redis para una sesión: `session:{sessionId}`.
   */
  private buildKey(sessionId: string): string {
    return `session:${sessionId}`;
  }

  /**
   * Guarda los datos de la sesión en Redis con expiración `ttl` (segundos).
   *
   * @remarks
   * Se usa `EX` para que Redis expire la entrada automáticamente,
   * evitando tener que limpiar sesiones vencidas manualmente.
   */
  async storeSession(
    sessionId: string,
    userId: string,
    deviceId: string | null,
    ttl: number,
    role: string = '',
    permissions: string[] = [],
  ): Promise<void> {
    await this.redis.set(
      this.buildKey(sessionId),
      JSON.stringify({ userId, deviceId, role, permissions }),
      'EX',
      ttl,
    );
  }

  /**
   * Recupera los datos de una sesión desde el cache.
   *
   * @remarks
   * Si el JSON almacenado está corrupto o no puede parsearse, se
   * retorna `null` en lugar de propagar el error, tratando la sesión
   * como inexistente.
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    const raw = await this.redis.get(this.buildKey(sessionId));
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<SessionData & { deviceId?: string }>;
      return {
        userId: parsed.userId ?? '',
        role: parsed.role ?? '',
        permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
      };
    } catch {
      return null;
    }
  }

  /**
   * Indica si existe una entrada de sesión activa (no expirada) en el cache.
   */
  async isSessionActive(sessionId: string): Promise<boolean> {
    return (await this.redis.get(this.buildKey(sessionId))) !== null;
  }

  /**
   * Revoca (elimina) la sesión del cache antes de su expiración natural.
   */
  async revokeSession(sessionId: string): Promise<void> {
    await this.redis.del(this.buildKey(sessionId));
  }
}
