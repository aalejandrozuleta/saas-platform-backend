import { Inject } from '@nestjs/common';
import { PasswordVO } from '@domain/value-objects/password.vo';
import { UserRepository } from '@domain/repositories/user.repository';
import { SecurityRepository } from '@domain/repositories/security.repository';
import {
  USER_REPOSITORY,
  SESSION_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
  SECURITY_REPOSITORY,
} from '@domain/token/repositories.tokens';
import { PASSWORD_HASHER, DOMAIN_EVENT_BUS, SESSION_CACHE } from '@domain/token/services.tokens';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { SessionRepository } from '@application/ports/session.repository';
import { RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { SessionCache } from '@application/ports/session-cache.port';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { PasswordChangedEvent } from '@application/events/password/password-changed.event';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { Clock } from '@application/ports/clock.port';

/**
 * Caso de uso: completar la recuperación de contraseña con el token
 * enviado por correo tras `forgot-password`.
 *
 * Flujo de validaciones de seguridad (en orden):
 *  1. Token existe y no ha expirado (mismo error de dominio para ambos
 *     casos, igual que `VerifyEmailUseCase`, para no filtrar cuál de los
 *     dos ocurrió)
 *  2. Nueva contraseña cumple requisitos de fortaleza (PasswordVO)
 *  3. Nueva contraseña es distinta de la actual
 *  4. Actualiza hash y fecha de último cambio (UserSecurity)
 *  5. Consume el token de recuperación (invariante de un solo uso)
 *  6. Revoca todas las sesiones activas + refresh tokens + cache Redis
 *  7. Emite `PasswordChangedEvent` → auditoría + alerta de seguridad
 *     desacopladas (mismo evento que `change-password`, ya que desde la
 *     perspectiva de auditoría es el mismo hecho de negocio)
 */
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(SECURITY_REPOSITORY)
    private readonly securityRepository: SecurityRepository,

    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,

    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(SESSION_CACHE)
    private readonly sessionCache: SessionCache,

    @Inject(DOMAIN_EVENT_BUS)
    private readonly eventBus: DomainEventBus,

    @Inject('CLOCK')
    private readonly clock: Clock,
  ) {}

  async execute(
    token: string,
    newPassword: string,
    context: { ip: string; country?: string },
  ): Promise<void> {
    const now = this.clock.now();

    // ── 1. Verificar token de recuperación ────────────────────────────────
    const user = await this.userRepository.findByPasswordResetToken(token);

    if (!user || user.isPasswordResetTokenExpired(now)) {
      throw DomainErrorFactory.invalidPasswordResetToken();
    }

    // ── 2. Nueva contraseña cumple requisitos de fortaleza ────────────────
    const newPasswordVO = PasswordVO.create(newPassword);

    // ── 3. Nueva contraseña ≠ contraseña actual ───────────────────────────
    const isSamePassword = await this.passwordHasher.verify(
      user.passwordHash,
      newPasswordVO.getValue(),
    );

    if (isSamePassword) {
      throw DomainErrorFactory.samePasswordNotAllowed();
    }

    // ── 4. Actualizar hash y fecha de último cambio ───────────────────────
    const newHash = await this.passwordHasher.hash(newPasswordVO.getValue());

    await this.userRepository.updatePasswordHash(user.id, newHash);
    await this.securityRepository.updateLastPasswordChange(user.id, now);

    // ── 5. Consumir token de recuperación ──────────────────────────────────
    await this.userRepository.update(user.consumePasswordReset());

    // ── 6. Revocar todas las sesiones activas ─────────────────────────────
    await this.revokeAllSessions(user.id, now);

    // ── 7. Emitir evento → auditoría + alerta de seguridad ────────────────
    this.eventBus.publish(new PasswordChangedEvent(user.id, context));
  }

  /**
   * Revoca sesiones en DB, refresh tokens y cache Redis en paralelo
   * donde sea posible.
   */
  private async revokeAllSessions(userId: string, now: Date): Promise<void> {
    const [revokedSessionIds] = await Promise.all([
      this.sessionRepository.revokeAllUserSessions(userId, now),
      this.refreshTokenRepository.revokeAllByUser(userId),
    ]);

    await Promise.all(revokedSessionIds.map((id) => this.sessionCache.revokeSession(id)));
  }
}
