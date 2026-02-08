import { randomUUID } from 'crypto';

import { UserRepository } from '@domain/repositories/user.repository';
import { EmailVO } from '@domain/value-objects/email.vo';
import { PasswordVO } from '@domain/value-objects/password.vo';
import { User } from '@domain/entities/user.entity';
import { EmailAlreadyExistsError } from '@domain/errors/email-already-exists.error';
import { PasswordHasherService } from '@infrastructure/crypto/password-hasher.service';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '@domain/token/user-repository.token';
import { PLATFORM_LOGGER, PlatformLogger } from '@saas/shared';
import { AuditService } from '@application/audit/audit.service';
import { AuditCategory } from '@domain/audit/audit-category.enum';
import { AuthAuditEvent } from '@domain/audit/auth-events.enum';

/**
 * Caso de uso para registrar usuario
 */
export class RegisterUserUseCase {
  constructor(
     @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    private readonly passwordHasher: PasswordHasherService,

    private readonly auditService: AuditService,

    @Inject(PLATFORM_LOGGER)
    private readonly logger: PlatformLogger,
  ) { }

  async execute(email: string, password: string, context: {
    ip: string;
    country?: string;
    deviceFingerprint?: string;
  },): Promise<User> {
    this.logger.info('Inicio registro de usuario', {
      email,
      ip: context.ip,
    });
    const emailVO = EmailVO.create(email);
    const passwordVO = PasswordVO.create(password);

    const exists = await this.userRepository.findByEmail(emailVO);
    if (exists) {
      this.logger.warn('Registro fallido: email ya existe', {
        email,
        ip: context.ip,
      });

      await this.auditService.log({
        userId: exists.id,
        category: AuditCategory.AUTH,
        event: AuthAuditEvent.REGISTER_FAILED,
        reason: 'EMAIL_ALREADY_EXISTS',
        ip: context.ip,
        country: context.country,
        deviceFingerprint: context.deviceFingerprint,
      });
      throw new EmailAlreadyExistsError();
    }

    const hash = await this.passwordHasher.hash(passwordVO.getValue());

    const user = User.create({
      id: randomUUID(),
      email: emailVO,
      passwordHash: hash,
    });

    await this.userRepository.save(user);

    await this.auditService.log({
      userId: user.id,
      category: AuditCategory.AUTH,
      event: AuthAuditEvent.REGISTER_SUCCESS,
      ip: context.ip,
      country: context.country,
      deviceFingerprint: context.deviceFingerprint,
      metadata: {
        email,
      },
    });

    this.logger.info('Usuario registrado correctamente', {
      userId: user.id,
      email,
    });

    return user;
  }
}
