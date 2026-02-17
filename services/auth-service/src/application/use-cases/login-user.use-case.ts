import { randomUUID } from 'node:crypto';

import { Inject } from '@nestjs/common';
import { EmailVO } from '@domain/value-objects/email.vo';
import { PasswordVO } from '@domain/value-objects/password.vo';
import { InvalidCredentialsError } from '@domain/errors/invalid-credentials.error';
import { UserRepository } from '@domain/repositories/user.repository';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { DeviceRepository } from '@domain/repositories/device.repository';
import { SessionRepository } from '@application/ports/session.repository';
import { RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { TokenService } from '@application/ports/token.service';
import { LoginContext } from '@domain/value-objects/login-context.vo';
import { Device } from '@domain/entities/device/device.entity';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { LoginFailedEvent } from '@application/events/login/login-failed.event';
import { LoginSucceededEvent } from '@application/events/login/login-succeeded.event';
import { LoginBlockedEvent } from '@application/events/login/login-blocked.event';
import { UnitOfWork } from '@application/ports/unit-of-work.port';
import { LoginAttemptedEvent } from '@application/events/login/login-attempted.event';
import { UserBlockedError } from '@domain/errors/user-blocked.error';
import { LoginPolicy } from '@domain/policies/login.policy';
import { DEVICE_REPOSITORY, REFRESH_TOKEN_REPOSITORY, SECURITY_REPOSITORY, SESSION_REPOSITORY, USER_REPOSITORY } from '@domain/token/repositories.tokens';
import { DOMAIN_EVENT_BUS, PASSWORD_HASHER, TOKEN_SERVICE, UNIT_OF_WORK } from '@domain/token/services.tokens';


export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(SECURITY_REPOSITORY)
    private readonly securityRepository: SecurityRepository,

    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: DeviceRepository,

    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,

    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,

    private readonly policy: LoginPolicy,

    @Inject(DOMAIN_EVENT_BUS)
    private readonly eventBus: DomainEventBus,

    @Inject(UNIT_OF_WORK)
    private readonly uow: UnitOfWork,
  ) { }

  async execute(email: string, password: string, context: LoginContext) {

    // 🔹 Emitimos intento
    this.eventBus.publish(
      new LoginAttemptedEvent(email, context),
    );

    const emailVO = EmailVO.create(email);
    const passwordVO = PasswordVO.create(password);

    const user = await this.userRepository.findByEmail(emailVO);

    if (!user) {
      this.eventBus.publish(
        new LoginFailedEvent(null, context, 'EMAIL_NOT_FOUND'),
      );
      throw new InvalidCredentialsError();
    }

    // 🔹 Manejo explícito de bloqueo
    try {
      this.policy.validateAttempts(
        user.failedLoginAttempts,
        user.blockedUntil,
      );
    } catch (error) {
      if (error instanceof UserBlockedError) {
        this.eventBus.publish(
          new LoginBlockedEvent(
            user.id,
            context,
            new Date()
          ),
        );
      }
      throw error;
    }

    const valid = await this.passwordHasher.verify(
      passwordVO.getValue(),
      user.passwordHash,
    );

    if (!valid) {
      await this.securityRepository.incrementFailedLoginAttempts(user.id);

      this.eventBus.publish(
        new LoginFailedEvent(user.id, context, 'INVALID_PASSWORD'),
      );

      throw new InvalidCredentialsError();
    }

    // 🔹 Todo lo crítico en transacción
    return this.uow.execute(async () => {

      await this.securityRepository.resetFailedLoginAttempts(user.id);

      // ===== DEVICE =====
      let device = (await this.deviceRepository.getDevicesByUserId(user.id))
        .find(d => d.fingerprint === context.deviceFingerprint);

      if (!device) {
        device = Device.create({
          id: randomUUID(),
          userId: user.id,
          fingerprint: context.deviceFingerprint!,
          ipAddress: context.ip,
          country: context.country,
          isTrusted: false,
          createdAt: new Date(),
        });

        device = await this.deviceRepository.save(device);
      }

      // 🔹 actualizar lastUsedAt
      device = device.updateLastUsed();
      await this.deviceRepository.save(device);

      this.policy.validateDevice(device.isTrusted);

      // ===== SESSION =====
      const session = await this.sessionRepository.create({
        userId: user.id,
        deviceId: device.id,
        ipAddress: context.ip,
        country: context.country,
      });

      // ===== TOKENS =====
      const accessToken = this.tokenService.generateAccessToken({
        userId: user.id,
        sessionId: session.id,
      });

      const refresh = this.tokenService.generateRefreshToken();

      await this.refreshTokenRepository.create({
        userId: user.id,
        sessionId: session.id,
        tokenHash: await this.passwordHasher.hash(refresh.token),
        expiresAt: refresh.expiresAt,
      });

      this.eventBus.publish(
        new LoginSucceededEvent(
          user.id,
          context,
          session.id,
        ),
      );

      return {
        token: accessToken,
        refreshToken: refresh.token,
      };
    });
  }
}
