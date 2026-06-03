import { Inject } from '@nestjs/common';

import {
  SESSION_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
} from '@domain/token/repositories.tokens';
import {
  DOMAIN_EVENT_BUS,
  SESSION_CACHE,
} from '@domain/token/services.tokens';
import { SessionRepository } from '@application/ports/session.repository';
import { RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { SessionCache } from '@application/ports/session-cache.port';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { LogoutAllEvent } from '@application/events/logout/logout-all.event';
import { Clock } from '@application/ports/clock.port';

/**
 * Caso de uso: cierre de **todas** las sesiones activas del usuario.
 *
 * @remarks
 * Útil cuando el usuario sospecha que su cuenta fue comprometida
 * o desea invalidar accesos desde todos los dispositivos.
 *
 * Responsabilidades:
 *  1. Revoca todas las sesiones activas en PostgreSQL y retorna sus IDs.
 *  2. Revoca todos los refresh tokens del usuario.
 *  3. Elimina cada entrada de Redis en paralelo.
 *  4. Emite `LogoutAllEvent` con el número de sesiones cerradas.
 *
 * Si el usuario no tiene sesiones activas, la operación
 * se completa silenciosamente con `revokedCount = 0`.
 */
export class LogoutAllUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,

    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,

    @Inject(SESSION_CACHE)
    private readonly sessionCache: SessionCache,

    @Inject(DOMAIN_EVENT_BUS)
    private readonly eventBus: DomainEventBus,

    @Inject('CLOCK')
    private readonly clock: Clock,
  ) {}

  /**
   * Ejecuta el cierre de todas las sesiones activas.
   *
   * @param userId - Identificador del usuario autenticado
   * @param context - Contexto de red de la petición
   * @returns Número de sesiones que fueron revocadas
   */
  async execute(
    userId: string,
    context: { ip: string; country?: string },
  ): Promise<{ revokedCount: number }> {
    const now = this.clock.now();

    // ── 1. Revocar sesiones en DB + refresh tokens en paralelo ─────────
    const [revokedSessionIds] = await Promise.all([
      this.sessionRepository.revokeAllUserSessions(userId, now),
      this.refreshTokenRepository.revokeAllByUser(userId),
    ]);

    // ── 2. Limpiar Redis por cada sesión revocada (en paralelo) ────────
    await Promise.all(
      revokedSessionIds.map((id) => this.sessionCache.revokeSession(id)),
    );

    const revokedCount = revokedSessionIds.length;

    // ── 3. Emitir evento → auditoría desacoplada ────────────────────────
    this.eventBus.publish(new LogoutAllEvent(userId, revokedCount, context));

    return { revokedCount };
  }
}
