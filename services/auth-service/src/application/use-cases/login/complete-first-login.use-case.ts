import { randomUUID } from 'node:crypto';

import { Inject } from '@nestjs/common';
import { User } from '@domain/entities/user/user.entity';
import { Device } from '@domain/entities/device/device.entity';
import { LoginContext } from '@domain/value-objects/login-context.vo';
import { UserRepository } from '@domain/repositories/user.repository';
import { UserProfileRepository } from '@domain/repositories/user-profile.repository';
import { DeviceRepository } from '@domain/repositories/device.repository';
import {
  USER_REPOSITORY,
  USER_PROFILE_REPOSITORY,
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
import { SessionRepository } from '@application/ports/session.repository';
import { RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { TokenService } from '@application/ports/token.service.token';
import { UnitOfWork } from '@application/ports/unit-of-work.port';
import { SessionCache } from '@application/ports/session-cache.port';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { LoginSucceededEvent } from '@application/events/login/login-succeeded.event';
import { Clock } from '@application/ports/clock.port';
import { EnvService } from '@config/env/env.service';
import { UserPermissionService } from '@application/services/user-permission.service';
import { completeLoginSession } from '@application/services/complete-login-session';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

const PASSWORD_CHANGE_REQUIRED_REASON = 'PASSWORD_CHANGE_REQUIRED';

/**
 * Caso de uso: resuelve el challenge `PASSWORD_CHANGE_REQUIRED` emitido por
 * `LoginUserUseCase` cuando un worker provisionado por su empresa
 * (`ProvisionWorkerUseCase`) intenta iniciar sesión con su contraseña
 * temporal.
 *
 * Flujo:
 *  1. Verifica el challenge token y exige `reason === 'PASSWORD_CHANGE_REQUIRED'`
 *     (rechaza tokens de otro flujo, ej. challenges de 2FA).
 *  2. Carga el usuario y confirma que `mustChangePassword` siga activo.
 *  3. Reemplaza la contraseña y limpia el flag.
 *  4. Carga el `UserProfile` (provisionado sin consentimiento, ver
 *     `UserProfile.createProvisioned()`) y registra la aceptación del
 *     tratamiento de datos personales y de los términos y condiciones.
 *  5. Confía el dispositivo (lo crea si no existía) — superar el cambio de
 *     contraseña obligatorio es prueba suficiente, igual que en
 *     `VerifyLoginChallengeUseCase`. No hay paso de 2FA: un worker recién
 *     provisionado nunca tiene 2FA configurado.
 *  6. Completa el login (sesión + tokens), igual que un login normal.
 */
export class CompleteFirstLoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: UserProfileRepository,

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

    @Inject(SESSION_CACHE)
    private readonly sessionCache: SessionCache,

    @Inject('CLOCK')
    private readonly clock: Clock,

    private readonly envService: EnvService,
    private readonly userPermissionService: UserPermissionService,
  ) {}

  async execute(
    changeToken: string,
    newPassword: string,
    context: { ip: string },
  ): Promise<{
    token: string;
    refreshToken: string;
    role: string;
    permissions: string[];
  }> {
    const claims = this.decodeChangeToken(changeToken);

    const user = await this.userRepository.findById(claims.userId);

    if (!user || !user.mustChangePassword) {
      throw DomainErrorFactory.invalidChallengeToken();
    }

    const updatedUser = await this.applyPasswordChange(user, newPassword);

    await this.acceptProfileConsent(updatedUser.id);

    const device = await this.resolveTrustedDevice(
      updatedUser.id,
      claims.deviceFingerprint,
      context,
    );

    const result = await this.completeLogin(updatedUser, device, {
      ip: context.ip,
      country: claims.country,
    });

    this.eventBus.publish(
      new LoginSucceededEvent(
        updatedUser.id,
        LoginContext.create({
          ip: context.ip,
          country: claims.country,
          deviceFingerprint: claims.deviceFingerprint,
        }),
        result.sessionId,
      ),
    );

    return {
      token: result.token,
      refreshToken: result.refreshToken,
      role: result.role,
      permissions: result.permissions,
    };
  }

  private decodeChangeToken(changeToken: string): {
    userId: string;
    deviceFingerprint?: string;
    country?: string;
  } {
    try {
      const claims = this.tokenService.verifyChallengeToken(changeToken);

      if (claims.reason !== PASSWORD_CHANGE_REQUIRED_REASON) {
        throw DomainErrorFactory.invalidChallengeToken();
      }

      return claims;
    } catch {
      throw DomainErrorFactory.invalidChallengeToken();
    }
  }

  private async applyPasswordChange(user: User, newPassword: string): Promise<User> {
    const passwordHash = await this.passwordHasher.hash(newPassword);
    const updatedUser = user.changePasswordAndClearRequirement(passwordHash);

    await this.userRepository.update(updatedUser);

    return updatedUser;
  }

  private async acceptProfileConsent(userId: string): Promise<void> {
    const profile = await this.userProfileRepository.findByUserId(userId);

    if (!profile) {
      throw DomainErrorFactory.userProfileNotFound();
    }

    await this.userProfileRepository.update(profile.acceptConsent());
  }

  /**
   * Confía el dispositivo del challenge: lo crea si nunca existió o lo
   * marca confiable si ya existía. Superar el cambio de contraseña
   * obligatorio es prueba suficiente de legitimidad, igual que superar un
   * challenge de 2FA en `VerifyLoginChallengeUseCase`.
   */
  private async resolveTrustedDevice(
    userId: string,
    deviceFingerprint: string | undefined,
    context: { ip: string },
  ): Promise<Device> {
    const existing = deviceFingerprint
      ? await this.deviceRepository.getByUserIdAndFingerprint(userId, deviceFingerprint)
      : null;

    return existing
      ? existing.markAsTrusted()
      : Device.create({
          id: randomUUID(),
          userId,
          fingerprint: deviceFingerprint!,
          ipAddress: context.ip,
          isTrusted: true,
          createdAt: new Date(),
        });
  }

  private async completeLogin(
    user: User,
    device: Device,
    context: { ip: string; country?: string },
  ) {
    return completeLoginSession(
      {
        uow: this.uow,
        deviceRepository: this.deviceRepository,
        sessionRepository: this.sessionRepository,
        refreshTokenRepository: this.refreshTokenRepository,
        passwordHasher: this.passwordHasher,
        tokenService: this.tokenService,
        sessionCache: this.sessionCache,
        envService: this.envService,
        userPermissionService: this.userPermissionService,
        userRepository: this.userRepository,
        clock: this.clock,
      },
      user,
      device,
      context,
    );
  }
}
