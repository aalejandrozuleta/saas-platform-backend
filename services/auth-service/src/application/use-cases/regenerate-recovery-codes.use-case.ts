import { Inject } from '@nestjs/common';
import { UserStatus } from '@domain/enums/user-status.enum';
import { UserRepository } from '@domain/repositories/user.repository';
import { SecurityRepository } from '@domain/repositories/security.repository';
import {
  USER_REPOSITORY,
  SECURITY_REPOSITORY,
  RECOVERY_CODE_REPOSITORY,
} from '@domain/token/repositories.tokens';
import { PASSWORD_HASHER, DOMAIN_EVENT_BUS, TOTP_SERVICE } from '@domain/token/services.tokens';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { RecoveryCodeRepository } from '@application/ports/recovery-code.repository';
import { TotpService } from '@application/ports/totp.service.port';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { RecoveryCodesRegeneratedEvent } from '@application/events/two-factor/recovery-codes-regenerated.event';
import { generateRecoveryCodes } from '@application/services/recovery-code-generator';

/**
 * Caso de uso: regenera el lote de recovery codes de un usuario con 2FA
 * activo.
 *
 * @remarks
 * Los recovery codes solo se muestran en texto plano una vez (al activar
 * 2FA o al regenerarlos aquí); si el usuario los perdió sin haberlos
 * guardado, esta es la única forma de obtener un lote nuevo mientras
 * todavía tiene acceso a su cuenta (requiere contraseña + TOTP vigente,
 * igual que `disable-2fa`). El lote anterior queda completamente
 * invalidado.
 */
export class RegenerateRecoveryCodesUseCase {
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
  ): Promise<{ recoveryCodes: string[] }> {
    const user = await this.userRepository.findById(userId);

    if (user?.status !== UserStatus.ACTIVE) {
      throw DomainErrorFactory.invalidCurrentPassword();
    }

    const isPasswordValid = await this.passwordHasher.verify(user.passwordHash, password);

    if (!isPasswordValid) {
      throw DomainErrorFactory.invalidCurrentPassword();
    }

    const security = await this.securityRepository.findByUserId(userId);

    if (!security?.twoFactorEnabled) {
      throw DomainErrorFactory.twoFactorNotEnabled();
    }

    const totpSecret = await this.securityRepository.getTotpSecret(userId);

    if (!totpSecret || !this.totpService.verifyToken(totpCode, totpSecret)) {
      throw DomainErrorFactory.invalidTotpCode();
    }

    const plainCodes = generateRecoveryCodes();
    const codeHashes = await Promise.all(plainCodes.map((code) => this.passwordHasher.hash(code)));

    await this.recoveryCodeRepository.deleteAllByUser(userId);
    await this.recoveryCodeRepository.createMany(userId, codeHashes);

    this.eventBus.publish(new RecoveryCodesRegeneratedEvent(userId, context));

    return { recoveryCodes: plainCodes };
  }
}
