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
import { LogoutEvent } from '@application/events/logout/logout.event';
import { Clock } from '@application/ports/clock.port';

/**
 * Caso de uso: cierre de la sesión actual del usuario.
 *
 * @remarks
 * Responsabilidades:
 *  1. Revoca la sesión activa en PostgreSQL.
 *  2. Revoca los refresh tokens asociados a esa sesión.
 *  3. Elimina la entrada de Redis para invalidar el JWT inmediatamente.
 *  4. Emite `LogoutEvent` → listener de auditoría desacoplado.
 *
 * La operación es idempotente: si la sesión ya fue revocada,
 * se completa sin error.
 */
export class LogoutUseCase {
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
   * Ejecuta el cierre de la sesión actual.
   *
   * @param userId - Identificador del usuario autenticado
   * @param sessionId - Identificador de la sesión a cerrar (extraído del JWT)
   * @param context - Contexto de red de la petición
   */
  async execute(
    userId: string,
    sessionId: string,
    context: { ip: string; country?: string },
  ): Promise<void> {
    const now = this.clock.now();

    // ── 1. Revocar en DB y cache (en paralelo) ──────────────────────────
    await Promise.all([
      this.sessionRepository.revokeById(sessionId, now),
      this.refreshTokenRepository.revokeBySession(sessionId),
      this.sessionCache.revokeSession(sessionId),
    ]);

    // ── 2. Emitir evento → auditoría desacoplada ────────────────────────
    this.eventBus.publish(new LogoutEvent(userId, sessionId, context));
  }
}
