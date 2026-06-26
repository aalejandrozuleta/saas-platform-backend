import { Inject } from '@nestjs/common';
import { UserStatus } from '@domain/enums/user-status.enum';
import { UserRepository } from '@domain/repositories/user.repository';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { USER_REPOSITORY, SECURITY_REPOSITORY, RECOVERY_CODE_REPOSITORY } from '@domain/token/repositories.tokens';
import { PASSWORD_HASHER, DOMAIN_EVENT_BUS, TOTP_SERVICE } from '@domain/token/services.tokens';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { RecoveryCodeRepository } from '@application/ports/recovery-code.repository';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { TotpService } from '@application/ports/totp.service.port';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { TwoFactorDisabledEvent } from '@application/events/two-factor/two-factor-disabled.event';

/**
 * Desactiva 2FA del usuario autenticado.
 *
 * Requiere contraseña correcta y código TOTP válido.
 * Elimina el secreto y los códigos de recuperación.
 */
export class Disable2faUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(SECURITY_REPOSITORY)
    private readonly securityRepository: SecurityRepository,

    @Inject(RECOVERY_CODE_REPOSITORY)
    private readonly recoveryCodeRepository: RecoveryCodeRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(TOTP_SERVICE)
    private readonly totpService: TotpService,

    @Inject(DOMAIN_EVENT_BUS)
    private readonly eventBus: DomainEventBus,
  ) {}

  async execute(
    userId: string,
    password: string,
    totpCode: string,
    context: { ip: string; country?: string },
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (user?.status !== UserStatus.ACTIVE) {
      throw DomainErrorFactory.invalidCurrentPassword();
    }

    const isPasswordValid = await this.passwordHasher.verify(
      user.passwordHash,
      password,
    );

    if (!isPasswordValid) {
      throw DomainErrorFactory.invalidCurrentPassword();
    }

    const security = await this.securityRepository.findByUserId(userId);

    if (!security?.twoFactorEnabled) {
      throw DomainErrorFactory.twoFactorNotEnabled();
    }

    const totpSecret = await this.securityRepository.getTotpSecret(userId);

    if (!totpSecret) {
      throw DomainErrorFactory.twoFactorNotEnabled();
    }

    const isCodeValid = this.totpService.verifyToken(totpCode, totpSecret);

    if (!isCodeValid) {
      throw DomainErrorFactory.invalidTotpCode();
    }

    await this.securityRepository.disableTwoFactor(userId);
    await this.recoveryCodeRepository.deleteAllByUser(userId);

    this.eventBus.publish(new TwoFactorDisabledEvent(userId, context));
  }
}
