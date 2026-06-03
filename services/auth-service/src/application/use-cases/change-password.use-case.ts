import { Inject } from '@nestjs/common';
import { PasswordVO } from '@domain/value-objects/password.vo';
import { UserStatus } from '@domain/enums/user-status.enum';
import { UserRepository } from '@domain/repositories/user.repository';
import { SecurityRepository } from '@domain/repositories/security.repository';
import {
  USER_REPOSITORY,
  SESSION_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
  SECURITY_REPOSITORY,
} from '@domain/token/repositories.tokens';
import {
  PASSWORD_HASHER,
  DOMAIN_EVENT_BUS,
  SESSION_CACHE,
} from '@domain/token/services.tokens';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { SessionRepository } from '@application/ports/session.repository';
import { RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { SessionCache } from '@application/ports/session-cache.port';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { PasswordChangedEvent } from '@application/events/password/password-changed.event';
import { PasswordChangeFailedEvent } from '@application/events/password/password-change-failed.event';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { Clock } from '@application/ports/clock.port';

/**
 * Caso de uso: cambio de contraseña para usuario autenticado.
 *
 * Flujo de validaciones de seguridad (en orden):
 *  1. Usuario existe y está ACTIVO
 *  2. Contraseña actual es correcta
 *  3. Nueva contraseña es distinta de la actual
 *  4. Nueva contraseña cumple requisitos de fortaleza (PasswordVO)
 *  5. Actualiza hash y fecha de último cambio (UserSecurity)
 *  6. Revoca todas las sesiones activas + refresh tokens + cache Redis
 *  7. Emite evento de dominio → auditoría desacoplada
 */
export class ChangePasswordUseCase {
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
    userId: string,
    currentPassword: string,
    newPassword: string,
    context: { ip: string; country?: string },
  ): Promise<void> {

    // ── 1. Verificar existencia y estado del usuario ──────────────────────
    const user = await this.userRepository.findById(userId);

    if (!user || user.status !== UserStatus.ACTIVE) {
      // No revelamos si el usuario existe o no para evitar user enumeration.
      // Un usuario autenticado con estado inválido es tratado igual.
      throw DomainErrorFactory.invalidCurrentPassword();
    }

    // ── 2. Verificar contraseña actual ────────────────────────────────────
    const currentPasswordVO = PasswordVO.create(currentPassword);

    const isCurrentValid = await this.passwordHasher.verify(
      user.passwordHash,
      currentPasswordVO.getValue(),
    );

    if (!isCurrentValid) {
      this.eventBus.publish(
        new PasswordChangeFailedEvent(userId, 'INVALID_CURRENT_PASSWORD', context),
      );
      throw DomainErrorFactory.invalidCurrentPassword();
    }

    // ── 3. Nueva contraseña ≠ contraseña actual ───────────────────────────
    const newPasswordVO = PasswordVO.create(newPassword);

    const isSamePassword = await this.passwordHasher.verify(
      user.passwordHash,
      newPasswordVO.getValue(),
    );

    if (isSamePassword) {
      this.eventBus.publish(
        new PasswordChangeFailedEvent(userId, 'SAME_PASSWORD_NOT_ALLOWED', context),
      );
      throw DomainErrorFactory.samePasswordNotAllowed();
    }

    // ── 4. Actualizar hash y fecha de último cambio ───────────────────────
    const now = this.clock.now();
    const newHash = await this.passwordHasher.hash(newPasswordVO.getValue());

    await this.userRepository.updatePasswordHash(userId, newHash);
    await this.securityRepository.updateLastPasswordChange(userId, now);

    // ── 5. Revocar todas las sesiones activas ─────────────────────────────
    await this.revokeAllSessions(userId, now);

    // ── 6. Emitir evento → auditoría desacoplada ──────────────────────────
    this.eventBus.publish(new PasswordChangedEvent(userId, context));
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

    await Promise.all(
      revokedSessionIds.map((id) => this.sessionCache.revokeSession(id)),
    );
  }
}
