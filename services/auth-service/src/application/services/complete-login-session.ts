import { randomUUID } from 'node:crypto';

import { type User } from '@domain/entities/user/user.entity';
import { type Device } from '@domain/entities/device/device.entity';
import { type SessionRepository } from '@application/ports/session.repository';
import { type RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { type PasswordHasher } from '@application/ports/password-hasher.port';
import { type TokenService } from '@application/ports/token.service.token';
import { type UnitOfWork } from '@application/ports/unit-of-work.port';
import { type SessionCache } from '@application/ports/session-cache.port';
import { type Clock } from '@application/ports/clock.port';
import { type UserRepository } from '@domain/repositories/user.repository';
import { type DeviceRepository } from '@domain/repositories/device.repository';
import { type EnvService } from '@config/env/env.service';
import { type UserPermissionService } from '@application/services/user-permission.service';

export interface CompleteLoginSessionDeps {
  uow: UnitOfWork;
  deviceRepository: DeviceRepository;
  sessionRepository: SessionRepository;
  refreshTokenRepository: RefreshTokenRepository;
  passwordHasher: PasswordHasher;
  tokenService: TokenService;
  sessionCache: SessionCache;
  envService: EnvService;
  userPermissionService: UserPermissionService;
  userRepository: UserRepository;
  clock: Clock;
}

export interface CompleteLoginSessionResult {
  token: string;
  refreshToken: string;
  sessionId: string;
  role: string;
  permissions: string[];
}

/**
 * Crea sesión + tokens dentro de una transacción y completa el login.
 *
 * Compartido por `LoginUserUseCase` y `VerifyLoginChallengeUseCase`: ambos
 * flujos terminan en el mismo estado (sesión activa, tokens emitidos,
 * `lastLoginAt` actualizado), solo difieren en cómo llegan hasta acá
 * (password directo vs. resolver un challenge de 2FA).
 */
export async function completeLoginSession(
  deps: CompleteLoginSessionDeps,
  user: User,
  device: Device,
  context: { ip: string; country?: string },
): Promise<CompleteLoginSessionResult> {
  return deps.uow.execute(async (tx) => {
    const updatedDevice = device.updateLastUsed();

    await deps.deviceRepository.save(updatedDevice, tx);

    const activeSessions = await deps.sessionRepository.countActiveSessions(user.id, tx);

    if (activeSessions >= 3) {
      await deps.sessionRepository.revokeOldestActiveSession(user.id, deps.clock.now(), tx);
    }

    const session = await deps.sessionRepository.create(
      {
        userId: user.id,
        deviceId: updatedDevice.id,
        ipAddress: context.ip,
        country: context.country,
      },
      tx,
    );

    const accessToken = deps.tokenService.generateAccessToken({
      userId: user.id,
      sessionId: session.id,
      role: user.role,
    });

    const permissions = await deps.userPermissionService.getEffectivePermissions(
      user.id,
      user.role,
    );

    await deps.sessionCache.storeSession(
      session.id,
      user.id,
      updatedDevice.id,
      deps.envService.get('REDIS_SESSION_TTL'),
      user.role,
      permissions,
    );

    const refresh = deps.tokenService.generateRefreshToken();

    const familyId = randomUUID();

    await deps.refreshTokenRepository.create(
      {
        userId: user.id,
        sessionId: session.id,
        jti: refresh.jti,
        familyId,
        tokenHash: await deps.passwordHasher.hash(refresh.token),
        expiresAt: refresh.expiresAt,
      },
      tx,
    );

    await deps.userRepository.updateLastLogin(user.id, deps.clock.now());

    return {
      token: accessToken,
      refreshToken: refresh.token,
      sessionId: session.id,
      role: user.role,
      permissions,
    };
  });
}
