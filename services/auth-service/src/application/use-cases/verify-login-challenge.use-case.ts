import { randomUUID } from 'node:crypto';

import { Inject } from '@nestjs/common';
import { User } from '@domain/entities/user/user.entity';
import { Device } from '@domain/entities/device/device.entity';
import { UserStatus } from '@domain/enums/user-status.enum';
import { LoginContext } from '@domain/value-objects/login-context.vo';
import { UserRepository } from '@domain/repositories/user.repository';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { DeviceRepository } from '@domain/repositories/device.repository';
import {
  USER_REPOSITORY,
  SECURITY_REPOSITORY,
  DEVICE_REPOSITORY,
  SESSION_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
  RECOVERY_CODE_REPOSITORY,
} from '@domain/token/repositories.tokens';
import {
  PASSWORD_HASHER,
  TOKEN_SERVICE,
  UNIT_OF_WORK,
  DOMAIN_EVENT_BUS,
  SESSION_CACHE,
  TOTP_SERVICE,
} from '@domain/token/services.tokens';
import { SessionRepository } from '@application/ports/session.repository';
import { RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { RecoveryCodeRepository } from '@application/ports/recovery-code.repository';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { TokenService } from '@application/ports/token.service.token';
import { TotpService } from '@application/ports/totp.service.port';
import { UnitOfWork } from '@application/ports/unit-of-work.port';
import { SessionCache } from '@application/ports/session-cache.port';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { LoginSucceededEvent } from '@application/events/login/login-succeeded.event';
import { Clock } from '@application/ports/clock.port';
import { EnvService } from '@config/env/env.service';
import { UserPermissionService } from '@application/services/user-permission.service';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Caso de uso: resuelve el challenge de step-up auth emitido por
 * `LoginUserUseCase` (`SECURITY_CHALLENGE_REQUIRED`) usando un código TOTP
 * o un recovery code, y completa el login.
 *
 * Flujo:
 *  1. Verifica el challenge token (corta duración, emitido en el intento
 *     de login original) y extrae userId/deviceFingerprint/country.
 *  2. Verifica exactamente un factor: TOTP o recovery code (no ambos).
 *  3. Confía el dispositivo (lo crea si no existía, o lo marca confiable)
 *     y confía el país, ya que superar el challenge es prueba suficiente.
 *  4. Completa el login (sesión + tokens), igual que un login normal.
 */
export class VerifyLoginChallengeUseCase {
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

    @Inject(RECOVERY_CODE_REPOSITORY)
    private readonly recoveryCodeRepository: RecoveryCodeRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,

    @Inject(TOTP_SERVICE)
    private readonly totpService: TotpService,

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
    challengeToken: string,
    credentials: { totpCode?: string; recoveryCode?: string },
    context: { ip: string },
  ): Promise<{ token: string; refreshToken: string }> {
    const claims = this.decodeChallengeToken(challengeToken);

    const user = await this.userRepository.findById(claims.userId);

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw DomainErrorFactory.invalidChallengeToken();
    }

    await this.verifyFactor(user.id, credentials);

    const device = await this.resolveTrustedDevice(user.id, claims.deviceFingerprint, context);

    await this.trustCountryIfNeeded(user.id, claims.country);

    const result = await this.completeLogin(user, device, {
      ip: context.ip,
      country: claims.country,
    });

    this.eventBus.publish(
      new LoginSucceededEvent(
        user.id,
        LoginContext.create({
          ip: context.ip,
          country: claims.country,
          deviceFingerprint: claims.deviceFingerprint,
        }),
        result.sessionId,
      ),
    );

    return { token: result.token, refreshToken: result.refreshToken };
  }

  private decodeChallengeToken(challengeToken: string): {
    userId: string;
    deviceFingerprint?: string;
    country?: string;
  } {
    try {
      const claims = this.tokenService.verifyChallengeToken(challengeToken);
      return claims;
    } catch {
      throw DomainErrorFactory.invalidChallengeToken();
    }
  }

  /**
   * Verifica exactamente un factor (TOTP o recovery code). El DTO ya exige
   * que solo uno de los dos venga presente; este chequeo es defensivo.
   */
  private async verifyFactor(
    userId: string,
    credentials: { totpCode?: string; recoveryCode?: string },
  ): Promise<void> {
    if (credentials.totpCode) {
      const secret = await this.securityRepository.getTotpSecret(userId);

      if (!secret || !this.totpService.verifyToken(credentials.totpCode, secret)) {
        throw DomainErrorFactory.invalidTotpCode();
      }

      return;
    }

    if (credentials.recoveryCode) {
      const candidates = await this.recoveryCodeRepository.findUnusedByUser(userId);

      for (const candidate of candidates) {
        if (await this.passwordHasher.verify(candidate.codeHash, credentials.recoveryCode)) {
          await this.recoveryCodeRepository.markUsed(candidate.id);
          return;
        }
      }

      throw DomainErrorFactory.invalidRecoveryCode();
    }

    throw DomainErrorFactory.twoFactorCredentialRequired();
  }

  /**
   * Confía el dispositivo del challenge: lo crea si nunca existió (caso
   * `NEW_DEVICE`) o lo marca confiable si ya existía (`UNTRUSTED_DEVICE` /
   * `TWO_FACTOR_REQUIRED`). Superar el segundo factor es prueba suficiente
   * de que el dispositivo es legítimo.
   */
  private async resolveTrustedDevice(
    userId: string,
    deviceFingerprint: string | undefined,
    context: { ip: string },
  ): Promise<Device> {
    const existing = deviceFingerprint
      ? await this.deviceRepository.getByUserIdAndFingerprint(userId, deviceFingerprint)
      : null;

    const device = existing
      ? existing.markAsTrusted()
      : Device.create({
          id: randomUUID(),
          userId,
          fingerprint: deviceFingerprint!,
          ipAddress: context.ip,
          isTrusted: true,
          createdAt: new Date(),
        });

    return device;
  }

  private async trustCountryIfNeeded(userId: string, country?: string): Promise<void> {
    if (!country) return;

    const profile = await this.securityRepository.findByUserId(userId);

    if (!profile?.trustedCountries.includes(country)) {
      await this.securityRepository.addTrustedCountry(userId, country);
    }
  }

  /**
   * Completa el login: crea sesión + tokens dentro de una transacción.
   * Misma lógica que `LoginUserUseCase.performLogin`.
   */
  private async completeLogin(
    user: User,
    device: Device,
    context: { ip: string; country?: string },
  ) {
    return this.uow.execute(async (tx) => {
      const updatedDevice = device.updateLastUsed();

      await this.deviceRepository.save(updatedDevice, tx);

      const activeSessions = await this.sessionRepository.countActiveSessions(user.id, tx);

      if (activeSessions >= 3) {
        await this.sessionRepository.revokeOldestActiveSession(user.id, this.clock.now(), tx);
      }

      const session = await this.sessionRepository.create(
        {
          userId: user.id,
          deviceId: updatedDevice.id,
          ipAddress: context.ip,
          country: context.country,
        },
        tx,
      );

      const accessToken = this.tokenService.generateAccessToken({
        userId: user.id,
        sessionId: session.id,
        role: user.role,
      });

      const permissions = await this.userPermissionService.getEffectivePermissions(
        user.id,
        user.role,
      );

      await this.sessionCache.storeSession(
        session.id,
        user.id,
        updatedDevice.id,
        this.envService.get('REDIS_SESSION_TTL'),
        user.role,
        permissions,
      );

      const refresh = this.tokenService.generateRefreshToken();
      const familyId = randomUUID();

      await this.refreshTokenRepository.create(
        {
          userId: user.id,
          sessionId: session.id,
          jti: refresh.jti,
          familyId,
          tokenHash: await this.passwordHasher.hash(refresh.token),
          expiresAt: refresh.expiresAt,
        },
        tx,
      );

      await this.userRepository.updateLastLogin(user.id, this.clock.now());

      return {
        token: accessToken,
        refreshToken: refresh.token,
        sessionId: session.id,
      };
    });
  }
}
