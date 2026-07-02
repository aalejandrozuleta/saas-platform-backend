import { randomBytes } from 'node:crypto';

import { Inject } from '@nestjs/common';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { SECURITY_REPOSITORY, RECOVERY_CODE_REPOSITORY } from '@domain/token/repositories.tokens';
import { PASSWORD_HASHER, DOMAIN_EVENT_BUS, TOTP_SERVICE } from '@domain/token/services.tokens';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { RecoveryCodeRepository } from '@application/ports/recovery-code.repository';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { TotpService } from '@application/ports/totp.service.port';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { TwoFactorVerifiedEvent } from '@application/events/two-factor/two-factor-verified.event';

const RECOVERY_CODE_COUNT = 8;

/**
 * Confirma el código TOTP y activa 2FA definitivamente.
 *
 * Genera y devuelve los códigos de recuperación de un solo uso.
 */
export class Verify2faUseCase {
  constructor(
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
    totpCode: string,
    context: { ip: string; country?: string },
  ): Promise<{ recoveryCodes: string[] }> {
    const pendingSecret = await this.securityRepository.getTotpPendingSecret(userId);

    if (!pendingSecret) {
      throw DomainErrorFactory.twoFactorSetupNotInitiated();
    }

    const isValid = this.totpService.verifyToken(totpCode, pendingSecret);

    if (!isValid) {
      throw DomainErrorFactory.invalidTotpCode();
    }

    await this.securityRepository.activateTwoFactor(userId);

    const plainCodes = this.generateRecoveryCodes();
    const codeHashes = await Promise.all(plainCodes.map((code) => this.passwordHasher.hash(code)));

    await this.recoveryCodeRepository.deleteAllByUser(userId);
    await this.recoveryCodeRepository.createMany(userId, codeHashes);

    this.eventBus.publish(new TwoFactorVerifiedEvent(userId, context));

    return { recoveryCodes: plainCodes };
  }

  private generateRecoveryCodes(): string[] {
    return Array.from(
      { length: RECOVERY_CODE_COUNT },
      () =>
        randomBytes(4).toString('hex').toUpperCase() +
        '-' +
        randomBytes(4).toString('hex').toUpperCase(),
    );
  }
}
