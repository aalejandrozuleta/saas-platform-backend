import { randomUUID } from 'node:crypto';

import { Inject } from '@nestjs/common';
import { EmailVO } from '@domain/value-objects/email.vo';
import { PasswordVO } from '@domain/value-objects/password.vo';
import { InvalidCredentialsError } from '@domain/errors/invalid-credentials.error';
import { USER_REPOSITORY } from '@domain/token/user-repository.token';
import { SECURITY_REPOSITORY } from '@domain/token/security-repository.token';
import { DEVICE_REPOSITORY } from '@domain/token/device.repository.token';
import { SESSION_REPOSITORY } from '@domain/token/session-repository.token';
import { REFRESH_TOKEN_REPOSITORY } from '@domain/token/refresh-token-repository.token';
import { PASSWORD_HASHER } from '@domain/token/password-hasher.token';
import { TOKEN_SERVICE } from '@domain/token/token-service.token';
import { UserRepository } from '@domain/repositories/user.repository';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { DeviceRepository } from '@domain/repositories/device.repository';
import { SessionRepository } from '@application/ports/session.repository';
import { RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { TokenService } from '@application/ports/token.service';
import { LoginValidationService } from '@application/services/login/login-validation.service';
import { LoginContext } from '@domain/value-objects/login-context.vo';
import { Device } from '@domain/entities/device/device.entity';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { LoginFailedEvent } from '@application/events/login-failed.event';
import { LoginSucceededEvent } from '@application/events/login-succeeded.event';
import { DOMAIN_EVENT_BUS } from '@domain/token/domain-event.token';
import { LoginBlockedEvent } from '@application/events/login-blocked.event';
import { UnitOfWork } from '@application/ports/unit-of-work.port';
import { UNIT_OF_WORK } from '@domain/token/unit-of-work.token';
import { LoginAttemptedEvent } from '@application/events/login-attempted.event';
import { UserBlockedError } from '@domain/errors/user-blocked.error';


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

    private readonly validation: LoginValidationService,

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
      this.validation.validateAttempts(
        user.failedLoginAttempts,
        user.blockedUntil,
      );
    } catch (error) {
      if (error instanceof UserBlockedError) {
        this.eventBus.publish(
          new LoginBlockedEvent(
            user.id,
            context,
            
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

      this.validation.validateDevice(device.isTrusted);

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
