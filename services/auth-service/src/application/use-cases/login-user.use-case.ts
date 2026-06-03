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
  SESSION_CACHE,
} from '@domain/token/services.tokens';
import { UserRepository } from '@domain/repositories/user.repository';
import { SecurityRepository,LoginSecurityProfile } from '@domain/repositories/security.repository';
import { DeviceRepository } from '@domain/repositories/device.repository';
import { SessionRepository } from '@application/ports/session.repository';
import { RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { TokenService } from '@application/ports/token.service.token';
import { UnitOfWork } from '@application/ports/unit-of-work.port';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { LoginAttemptedEvent } from '@application/events/login/login-attempted.event';
import { LoginFailedEvent } from '@application/events/login/login-failed.event';
import { LoginBlockedEvent } from '@application/events/login/login-blocked.event';
import { LoginSucceededEvent } from '@application/events/login/login-succeeded.event';
import { Clock } from '@application/ports/clock.port';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { SessionCache } from '@application/ports/session-cache.port';
import { EnvService } from '@config/env/env.service';
import { LoginSecurityChallengeService } from '@application/security/login-security-challenge.service';
import { LoginChallengeReason } from '@application/security/login-challenge.types';
import { ErrorCode } from '@saas/shared';

/**
 * Caso de uso encargado de autenticar un usuario en el sistema.
 *
 * Flujo:
 * 1. Buscar usuario por email
 * 2. Validar contraseña
 * 3. Evaluar políticas de login
 * 4. Registrar intento de autenticación
 * 5. Crear sesión y refresh token
 * 6. Emitir eventos de dominio
 *
 * Este caso de uso representa el punto central del proceso de autenticación.
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

    @Inject(SESSION_CACHE)
    private readonly sessionCache: SessionCache,

    private readonly envService: EnvService,
    private readonly loginSecurityChallengeService: LoginSecurityChallengeService,

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

    await this.validatePassword(
      user,
      password,
      context,
      email,
    );

    const securityProfile =
      await this.securityRepository.findByUserId(user.id);

    const device = await this.resolveLoginDevice(
      user,
      securityProfile,
      context,
    );

    const result = await this.performLogin(user, device, context);

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
        new LoginFailedEvent(
          null,
          email,
          context,
          'INVALID_CREDENTIALS',
        ),
      );

      throw DomainErrorFactory.invalidCredentials();
    }

    const normalizedUser =
      await this.releaseExpiredTemporaryBlock(user);

    this.policy.validateUserStatus(normalizedUser.status);

    try {
      this.policy.validateAttempts(
        normalizedUser.failedLoginAttempts,
        normalizedUser.blockedUntil,
        this.clock.now(),
      );
    } catch (error) {

      if (
        error instanceof Error &&
        'code' in error &&
        error.code === ErrorCode.USER_BLOCKED
      ) {
        this.eventBus.publish(
          new LoginBlockedEvent(
            normalizedUser.id,
            context,
            normalizedUser.blockedUntil,
          ),
        );
      }

      throw error;
    }

    return normalizedUser;
  }

  /**
   * Valida contraseña y gestiona intentos fallidos.
   */
  private async validatePassword(
    user: User,
    password: string,
    context: LoginContext,
    email: string,
  ): Promise<void> {

    const passwordVO = PasswordVO.create(password);

    const valid = await this.passwordHasher.verify(
      user.passwordHash,
      passwordVO.getValue(),
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
          email,
          context,
          'INVALID_PASSWORD',
        ),
      );

      throw DomainErrorFactory.invalidCredentials();
    }

    await this.securityRepository.resetFailedLoginAttempts(
      user.id,
    );
  }

  /**
   * Libera bloqueos temporales expirados para no dejar cuentas atrapadas.
   */
  private async releaseExpiredTemporaryBlock(
    user: User,
  ): Promise<User> {
    if (!user.hasExpiredTemporaryBlock(this.clock.now())) {
      return user;
    }

    await this.securityRepository.releaseTemporaryBlock(user.id);

    return user.releaseTemporaryBlock();
  }

  /**
   * Ejecuta operaciones críticas dentro de transacción.
   */
  private async performLogin(
    user: User,
    device: Device,
    context: LoginContext,
  ) {

    return this.uow.execute(async (tx) => {
      device = device.updateLastUsed();

      await this.deviceRepository.save(device, tx);

      const activeSessions =
        await this.sessionRepository.countActiveSessions(
          user.id,
          tx,
        );

      if (activeSessions >= 3) {

        await this.sessionRepository.revokeOldestActiveSession(
          user.id,
          this.clock.now(),
          tx,
        );
      }

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

      await this.sessionCache.storeSession(
        session.id,
        user.id,
        device.id,
        this.envService.get('REDIS_SESSION_TTL')
      );

      const refresh = this.tokenService.generateRefreshToken();

      const familyId = randomUUID();

      await this.refreshTokenRepository.create({
        userId: user.id,
        sessionId: session.id,
        jti: refresh.jti,
        familyId,
        tokenHash: await this.passwordHasher.hash(refresh.token),
        expiresAt: refresh.expiresAt,
      }, tx);

      return {
        token: accessToken,
        refreshToken: refresh.token,
        sessionId: session.id,
      };
    });
  }

  private async resolveLoginDevice(
    user: User,
    securityProfile: LoginSecurityProfile | null,
    context: LoginContext,
  ): Promise<Device> {
    const device = await this.deviceRepository.getByUserIdAndFingerprint(
      user.id,
      context.deviceFingerprint!,
    );

    if (!device) {
      throw this.loginSecurityChallengeService.createChallenge(
        user,
        securityProfile,
        context,
        LoginChallengeReason.NEW_DEVICE,
      );
    }

    if (!device.isTrusted) {
      throw this.loginSecurityChallengeService.createChallenge(
        user,
        securityProfile,
        context,
        LoginChallengeReason.UNTRUSTED_DEVICE,
      );
    }

    if (
      securityProfile?.trustedCountries.length &&
      context.country &&
      !securityProfile.trustedCountries.includes(context.country)
    ) {
      throw this.loginSecurityChallengeService.createChallenge(
        user,
        securityProfile,
        context,
        LoginChallengeReason.UNTRUSTED_COUNTRY,
      );
    }

    return device;
  }
}
