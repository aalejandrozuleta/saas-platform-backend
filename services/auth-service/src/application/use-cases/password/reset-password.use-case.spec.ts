import { ErrorCode } from '@saas/shared';
import { User } from '@domain/entities/user/user.entity';
import { EmailVO } from '@domain/value-objects/email.vo';
import { UserStatus } from '@domain/enums/user-status.enum';
import { UserRole } from '@domain/enums/user-role.enum';
import { type UserRepository } from '@domain/repositories/user.repository';
import { type SecurityRepository } from '@domain/repositories/security.repository';
import { type SessionRepository } from '@application/ports/session.repository';
import { type RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { type PasswordHasher } from '@application/ports/password-hasher.port';
import { type SessionCache } from '@application/ports/session-cache.port';
import { type DomainEventBus } from '@application/events/domain-event.bus';
import { type Clock } from '@application/ports/clock.port';
import { PasswordChangedEvent } from '@application/events/password/password-changed.event';

import { ResetPasswordUseCase } from './reset-password.use-case';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;

  let userRepository: jest.Mocked<UserRepository>;
  let securityRepository: jest.Mocked<SecurityRepository>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let sessionCache: jest.Mocked<SessionCache>;
  let eventBus: jest.Mocked<DomainEventBus>;
  let clock: jest.Mocked<Clock>;

  const NOW = new Date('2026-01-01T00:00:00.000Z');

  const context = {
    ip: '127.0.0.1',
    country: 'CO',
  };

  const createUser = (
    overrides?: Partial<{
      passwordResetToken?: string;
      passwordResetExpiresAt?: Date;
    }>,
  ) =>
    User.fromPersistence({
      id: 'user-1',
      email: EmailVO.create('test@example.com'),
      passwordHash: 'current-hash',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      failedLoginAttempts: 0,
      lockoutCount: 0,
      blockedUntil: undefined,
      createdAt: new Date(),
      passwordResetToken: 'reset-token-abc',
      passwordResetExpiresAt: new Date(NOW.getTime() + 60_000),
      ...overrides,
    });

  beforeEach(() => {
    jest.resetAllMocks();

    userRepository = {
      findByPasswordResetToken: jest.fn(),
      update: jest.fn(),
      updatePasswordHash: jest.fn(),
    } as any;

    securityRepository = {
      updateLastPasswordChange: jest.fn(),
    } as any;

    sessionRepository = {
      revokeAllUserSessions: jest.fn(),
    } as any;

    refreshTokenRepository = {
      revokeAllByUser: jest.fn(),
    } as any;

    passwordHasher = {
      verify: jest.fn(),
      hash: jest.fn(),
    } as any;

    sessionCache = {
      revokeSession: jest.fn(),
    } as any;

    eventBus = {
      publish: jest.fn(),
    } as any;

    clock = {
      now: jest.fn().mockReturnValue(NOW),
    } as any;

    useCase = new ResetPasswordUseCase(
      userRepository,
      securityRepository,
      sessionRepository,
      refreshTokenRepository,
      passwordHasher,
      sessionCache,
      eventBus,
      clock,
    );
  });

  describe('flujo exitoso', () => {
    beforeEach(() => {
      userRepository.findByPasswordResetToken.mockResolvedValue(createUser());
      passwordHasher.verify.mockResolvedValue(false);
      passwordHasher.hash.mockResolvedValue('new-hash');
      userRepository.updatePasswordHash.mockResolvedValue();
      securityRepository.updateLastPasswordChange.mockResolvedValue();
      userRepository.update.mockResolvedValue();
      sessionRepository.revokeAllUserSessions.mockResolvedValue(['session-1']);
      refreshTokenRepository.revokeAllByUser.mockResolvedValue();
      sessionCache.revokeSession.mockResolvedValue();
    });

    it('debe actualizar el hash de la contraseña', async () => {
      await useCase.execute('reset-token-abc', 'NewPassword456@', context);

      expect(passwordHasher.hash).toHaveBeenCalledWith('NewPassword456@');
      expect(userRepository.updatePasswordHash).toHaveBeenCalledWith('user-1', 'new-hash');
    });

    it('debe consumir el token de recuperación', async () => {
      await useCase.execute('reset-token-abc', 'NewPassword456@', context);

      expect(userRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ passwordResetToken: undefined }),
      );
    });

    it('debe revocar todas las sesiones activas y su cache', async () => {
      await useCase.execute('reset-token-abc', 'NewPassword456@', context);

      expect(sessionRepository.revokeAllUserSessions).toHaveBeenCalledWith('user-1', NOW);
      expect(refreshTokenRepository.revokeAllByUser).toHaveBeenCalledWith('user-1');
      expect(sessionCache.revokeSession).toHaveBeenCalledWith('session-1');
    });

    it('debe emitir PasswordChangedEvent con el userId y contexto', async () => {
      await useCase.execute('reset-token-abc', 'NewPassword456@', context);

      expect(eventBus.publish).toHaveBeenCalledWith(expect.any(PasswordChangedEvent));
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', context }),
      );
    });
  });

  describe('validación del token', () => {
    it('debe lanzar INVALID_PASSWORD_RESET_TOKEN si el token no existe', async () => {
      userRepository.findByPasswordResetToken.mockResolvedValue(null);

      await expect(
        useCase.execute('invalid-token', 'NewPassword456@', context),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_PASSWORD_RESET_TOKEN });

      expect(userRepository.updatePasswordHash).not.toHaveBeenCalled();
    });

    it('debe lanzar INVALID_PASSWORD_RESET_TOKEN si el token ya expiró', async () => {
      userRepository.findByPasswordResetToken.mockResolvedValue(
        createUser({ passwordResetExpiresAt: new Date(NOW.getTime() - 1000) }),
      );

      await expect(
        useCase.execute('reset-token-abc', 'NewPassword456@', context),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_PASSWORD_RESET_TOKEN });

      expect(userRepository.updatePasswordHash).not.toHaveBeenCalled();
    });
  });

  describe('validación de nueva contraseña', () => {
    it('debe lanzar SAME_PASSWORD_NOT_ALLOWED si la nueva contraseña es igual a la actual', async () => {
      userRepository.findByPasswordResetToken.mockResolvedValue(createUser());
      passwordHasher.verify.mockResolvedValue(true);

      await expect(
        useCase.execute('reset-token-abc', 'SamePassword1!', context),
      ).rejects.toMatchObject({ code: ErrorCode.SAME_PASSWORD_NOT_ALLOWED });

      expect(userRepository.updatePasswordHash).not.toHaveBeenCalled();
    });

    it('debe rechazar una nueva contraseña débil (PasswordVO)', async () => {
      userRepository.findByPasswordResetToken.mockResolvedValue(createUser());

      await expect(useCase.execute('reset-token-abc', 'weak', context)).rejects.toThrow();

      expect(passwordHasher.verify).not.toHaveBeenCalled();
    });
  });
});
