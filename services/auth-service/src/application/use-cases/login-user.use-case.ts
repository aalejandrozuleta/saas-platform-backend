import { randomUUID } from 'node:crypto';

import { Inject } from '@nestjs/common';
import { User } from '@domain/entities/user/user.entity';
import { Device } from '@domain/entities/device/device.entity';
import { LoginPolicy } from '@domain/policies/login.policy';
import { LoginContext } from '@domain/value-objects/login-context.vo';
import { EmailVO } from '@domain/value-objects/email.vo';
import { PasswordVO } from '@domain/value-objects/password.vo';
import {
  USER_REPOSITORY,
  SECURITY_REPOSITORY,
  DEVICE_REPOSITORY,
  SESSION_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
} from '@domain/token/repositories.tokens';
import {
  PASSWORD_HASHER,
  TOKEN_SERVICE,
  UNIT_OF_WORK,
  DOMAIN_EVENT_BUS,
} from '@domain/token/services.tokens';
import { UserRepository } from '@domain/repositories/user.repository';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { DeviceRepository } from '@domain/repositories/device.repository';
import { SessionRepository } from '@application/ports/session.repository';
import { RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { TokenService } from '@application/ports/token.service';
import { UnitOfWork } from '@application/ports/unit-of-work.port';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { LoginAttemptedEvent } from '@application/events/login/login-attempted.event';
import { LoginFailedEvent } from '@application/events/login/login-failed.event';
import { LoginBlockedEvent } from '@application/events/login/login-blocked.event';
import { LoginSucceededEvent } from '@application/events/login/login-succeeded.event';
import { InvalidCredentialsError } from '@domain/errors/invalid-credentials.error';
import { UserBlockedError } from '@domain/errors/user-blocked.error';
import { Clock } from '@application/ports/clock.port';

/**
 * Caso de uso encargado de autenticar usuarios.
 */
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

    @Inject(UNIT_OF_WORK)
    private readonly uow: UnitOfWork,

    @Inject(DOMAIN_EVENT_BUS)
    private readonly eventBus: DomainEventBus,

    private readonly policy: LoginPolicy,

    @Inject('CLOCK')
    private readonly clock: Clock,
  ) { }

  async execute(
    email: string,
    password: string,
    context: LoginContext,
  ): Promise<{ token: string; refreshToken: string }> {

    this.eventBus.publish(
      new LoginAttemptedEvent(email, context),
    );

    this.policy.validateDeviceFingerprint(context.deviceFingerprint);

    const user = await this.validateUser(email, context);

    await this.validatePassword(user, password, context);

    const result = await this.performLogin(user, context);

    this.eventBus.publish(
      new LoginSucceededEvent(
        user.id,
        context,
        result.sessionId,
      ),
    );

    return {
      token: result.token,
      refreshToken: result.refreshToken,
    };
  }

  /**
   * Valida existencia y estado del usuario.
   */
  private async validateUser(
    email: string,
    context: LoginContext,
  ): Promise<User> {

    const emailVO = EmailVO.create(email);
    const user = await this.userRepository.findByEmail(emailVO);

    if (!user) {
      this.eventBus.publish(
        new LoginFailedEvent(null, context, 'INVALID_CREDENTIALS'),
      );

      throw new InvalidCredentialsError();
    }

    this.policy.validateUserStatus(user.status);

    try {
      this.policy.validateAttempts(
        user.failedLoginAttempts,
        user.blockedUntil,
        this.clock.now(),
      );
    } catch (error) {

      if (error instanceof UserBlockedError) {
        this.eventBus.publish(
          new LoginBlockedEvent(
            user.id,
            context,
            user.blockedUntil,
          ),
        );
      }

      throw error;
    }

    return user;
  }

  /**
   * Valida contraseña y gestiona intentos fallidos.
   */
  private async validatePassword(
    user: User,
    password: string,
    context: LoginContext,
  ): Promise<void> {

    const passwordVO = PasswordVO.create(password);

    const valid = await this.passwordHasher.verify(
      passwordVO.getValue(),
      user.passwordHash,
    );

    if (!valid) {
      await this.securityRepository.registerFailedAttempt(
        user.id,
        this.policy.getMaxAttempts(),
        this.policy.lockDuration(),
        this.clock.now(),
      );


      this.eventBus.publish(
        new LoginFailedEvent(
          user.id,
          context,
          'INVALID_PASSWORD',
        ),
      );

      throw new InvalidCredentialsError();
    }
  }

  /**
   * Ejecuta operaciones críticas dentro de transacción.
   */
  private async performLogin(
    user: User,
    context: LoginContext,
  ) {

    return this.uow.execute(async (tx) => {

      await this.securityRepository.resetFailedLoginAttempts(
        user.id,
        tx,
      );

      let device = await this.deviceRepository.getByUserIdAndFingerprint(
        user.id,
        context.deviceFingerprint!,
        tx,
      );

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

        device = await this.deviceRepository.save(device, tx);
      }

      device = device.updateLastUsed();

      await this.deviceRepository.save(device, tx);

      this.policy.validateDevice(device.isTrusted);

      const security = await this.securityRepository.findByUserId(
        user.id,
        tx,
      );

      this.policy.validateCountry(
        security?.trustedCountries,
        context.country,
      );

      const session = await this.sessionRepository.create(
        {
          userId: user.id,
          deviceId: device.id,
          ipAddress: context.ip,
          country: context.country,
        },
        tx,
      );

      const accessToken = this.tokenService.generateAccessToken({
        userId: user.id,
        sessionId: session.id,
      });

      const refresh = this.tokenService.generateRefreshToken();

      await this.refreshTokenRepository.create(
        {
          userId: user.id,
          sessionId: session.id,
          tokenHash: await this.passwordHasher.hash(refresh.token),
          expiresAt: refresh.expiresAt,
        },
        tx,
      );

      return {
        token: accessToken,
        refreshToken: refresh.token,
        sessionId: session.id,
      };
    });
  }
}
