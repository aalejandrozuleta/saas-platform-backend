import { randomUUID } from 'node:crypto';

import { UserRepository } from '@domain/repositories/user.repository';
import { EmailVO } from '@domain/value-objects/email.vo';
import { PasswordVO } from '@domain/value-objects/password.vo';
import { User } from '@domain/entities/user/user.entity';
import { EmailAlreadyExistsError } from '@domain/errors/email-already-exists.error';
import { Inject } from '@nestjs/common';
import { PLATFORM_LOGGER, PlatformLogger } from '@saas/shared';
import { AuditCategory } from '@domain/audit/audit-category.enum';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { AuditLogger } from '@application/ports/audit-logger.port';
import { USER_REPOSITORY } from '@domain/token/repositories.tokens';
import { AUDIT_LOGGER, PASSWORD_HASHER } from '@domain/token/services.tokens';
import { AuthAuditEvent } from '@application/audit/auth-events.enum';

/**
 * Caso de uso para registrar usuario
 */
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLogger,

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

      await this.auditLogger.log({
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

    await this.auditLogger.log({
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
