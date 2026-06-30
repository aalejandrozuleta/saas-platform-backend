import { randomUUID } from 'node:crypto';

import { UserRepository } from '@domain/repositories/user.repository';
import { EmailVO } from '@domain/value-objects/email.vo';
import { PasswordVO } from '@domain/value-objects/password.vo';
import { User } from '@domain/entities/user/user.entity';
import { Device } from '@domain/entities/device/device.entity';
import { Inject } from '@nestjs/common';
import { PLATFORM_LOGGER, PlatformLogger } from '@saas/shared';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { AuditLogger } from '@application/ports/audit-logger.port';
import {
  DEVICE_REPOSITORY,
  SECURITY_REPOSITORY,
  USER_REPOSITORY,
} from '@domain/token/repositories.tokens';
import { AUDIT_LOGGER, DOMAIN_EVENT_BUS, PASSWORD_HASHER } from '@domain/token/services.tokens';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { AuthActivityReportFactory } from '@application/audit/auth-activity-report.factory';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { DeviceRepository } from '@domain/repositories/device.repository';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { UserRegisteredEvent } from '@application/events/user/user-registered.event';

/**
 * Caso de uso para registrar usuario
 */
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: DeviceRepository,

    @Inject(SECURITY_REPOSITORY)
    private readonly securityRepository: SecurityRepository,

    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLogger,

    @Inject(PLATFORM_LOGGER)
    private readonly logger: PlatformLogger,

    @Inject(DOMAIN_EVENT_BUS)
    private readonly eventBus: DomainEventBus,
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

      await this.auditLogger.log(
        AuthActivityReportFactory.registerFailed({
          userId: exists.id,
          email,
          reason: 'EMAIL_ALREADY_EXISTS',
          ip: context.ip,
          country: context.country,
          deviceFingerprint: context.deviceFingerprint,
        }),
      );
      throw DomainErrorFactory.emailAlreadyExists();
    }

    const hash = await this.passwordHasher.hash(passwordVO.getValue());

    const user = User.create({
      id: randomUUID(),
      email: emailVO,
      passwordHash: hash,
    });

    await this.userRepository.save(user);
    await this.registerTrustedDevice(user, context);
    await this.registerTrustedCountry(user.id, context.country);

    await this.auditLogger.log(
      AuthActivityReportFactory.registerSuccess({
        userId: user.id,
        email,
        ip: context.ip,
        country: context.country,
        deviceFingerprint: context.deviceFingerprint,
      }),
    );

    this.logger.info('Usuario registrado correctamente', {
      userId: user.id,
      email,
    });

    this.eventBus.publish(
      new UserRegisteredEvent(user.id, email, {
        ip: context.ip,
        country: context.country,
      }),
    );

    return user;
  }

  private async registerTrustedCountry(
    userId: string,
    country?: string,
  ): Promise<void> {
    if (!country) return;
    await this.securityRepository.addTrustedCountry(userId, country);
  }

  private async registerTrustedDevice(
    user: User,
    context: {
      ip: string;
      country?: string;
      deviceFingerprint?: string;
    },
  ): Promise<void> {
    if (!context.deviceFingerprint) {
      return;
    }

    const device = Device.create({
      id: randomUUID(),
      userId: user.id,
      fingerprint: context.deviceFingerprint,
      ipAddress: context.ip,
      country: context.country,
      isTrusted: true,
      createdAt: new Date(),
    });

    await this.deviceRepository.save(device);
  }
}
