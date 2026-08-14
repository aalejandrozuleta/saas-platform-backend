import { Inject } from '@nestjs/common';
import { SESSION_REPOSITORY, REFRESH_TOKEN_REPOSITORY } from '@domain/token/repositories.tokens';
import { SESSION_CACHE, DOMAIN_EVENT_BUS } from '@domain/token/services.tokens';
import { SessionRepository } from '@application/ports/session.repository';
import { RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { SessionCache } from '@application/ports/session-cache.port';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { LogoutEvent } from '@application/events/logout/logout.event';
import { Clock } from '@application/ports/clock.port';

/**
 * Caso de uso: cierre de una sesión distinta a la actual, a petición del
 * propio usuario (por ejemplo, desde la pantalla de "sesiones activas").
 *
 * @remarks
 * Responsabilidades:
 *  1. Verifica que la sesión objetivo pertenezca al usuario autenticado,
 *     evitando que un usuario revoque sesiones ajenas.
 *  2. Revoca la sesión en PostgreSQL y sus refresh tokens asociados.
 *  3. Elimina la entrada de Redis para invalidar el JWT inmediatamente.
 *  4. Emite `LogoutEvent` → listener de auditoría desacoplado.
 *
 * A diferencia de `LogoutUseCase`, aquí `targetSessionId` no tiene por qué
 * coincidir con la sesión desde la que se hace la petición.
 */
export class RevokeSessionUseCase {
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
   * Ejecuta el cierre de la sesión indicada.
   *
   * @param userId - Identificador del usuario autenticado
   * @param targetSessionId - Identificador de la sesión a revocar
   * @param context - Contexto de red de la petición
   * @throws Error de dominio si la sesión no existe o no pertenece al usuario
   */
  async execute(
    userId: string,
    targetSessionId: string,
    context: { ip: string; country?: string },
  ): Promise<void> {
    const belongs = await this.sessionRepository.sessionBelongsToUser(targetSessionId, userId);

    if (!belongs) {
      throw DomainErrorFactory.sessionNotFound();
    }

    await Promise.all([
      this.sessionRepository.revokeById(targetSessionId, this.clock.now()),
      this.refreshTokenRepository.revokeBySession(targetSessionId),
      this.sessionCache.revokeSession(targetSessionId),
    ]);

    this.eventBus.publish(new LogoutEvent(userId, targetSessionId, context));
  }
}
