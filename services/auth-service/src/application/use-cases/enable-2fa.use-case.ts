import { Inject } from '@nestjs/common';
import { UserStatus } from '@domain/enums/user-status.enum';
import { UserRepository } from '@domain/repositories/user.repository';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { USER_REPOSITORY, SECURITY_REPOSITORY } from '@domain/token/repositories.tokens';
import { PASSWORD_HASHER, DOMAIN_EVENT_BUS, TOTP_SERVICE } from '@domain/token/services.tokens';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { TotpService, TotpSetup } from '@application/ports/totp.service.port';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { TwoFactorEnabledEvent } from '@application/events/two-factor/two-factor-enabled.event';

/**
 * Inicia el flujo de activación de 2FA (TOTP).
 *
 * Genera un secreto TOTP y lo almacena como pendiente hasta que
 * el usuario lo confirme con `verify-2fa`. 2FA NO queda activo aún.
 */
export class Enable2faUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(SECURITY_REPOSITORY)
    private readonly securityRepository: SecurityRepository,

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
    context: { ip: string; country?: string },
  ): Promise<TotpSetup> {
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

    if (security?.twoFactorEnabled) {
      throw DomainErrorFactory.twoFactorAlreadyEnabled();
    }

    const setup = await this.totpService.generateSecret(user.email.getValue(), 'SaaS Platform');

    await this.securityRepository.saveTotpPendingSecret(userId, setup.secret);

    this.eventBus.publish(new TwoFactorEnabledEvent(userId, context));

    return setup;
  }
}
