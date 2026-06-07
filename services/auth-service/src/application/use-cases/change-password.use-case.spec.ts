import { ErrorCode } from '@saas/shared';
import { User } from '@domain/entities/user/user.entity';
import { EmailVO } from '@domain/value-objects/email.vo';
import { UserStatus } from '@domain/enums/user-status.enum';
import { type UserRepository } from '@domain/repositories/user.repository';
import { type SecurityRepository } from '@domain/repositories/security.repository';
import { type SessionRepository } from '@application/ports/session.repository';
import { type RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { type PasswordHasher } from '@application/ports/password-hasher.port';
import { type SessionCache } from '@application/ports/session-cache.port';
import { type DomainEventBus } from '@application/events/domain-event.bus';
import { type Clock } from '@application/ports/clock.port';
import { PasswordChangedEvent } from '@application/events/password/password-changed.event';
import { PasswordChangeFailedEvent } from '@application/events/password/password-change-failed.event';

import { ChangePasswordUseCase } from './change-password.use-case';

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;

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

  // ──────────────────────────────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────────────────────────────

  const createUser = (overrides?: Partial<{
    status: UserStatus;
    passwordHash: string;
  }>) =>
    User.fromPersistence({
      id: 'user-1',
      email: EmailVO.create('test@example.com'),
      passwordHash: 'current-hash',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      failedLoginAttempts: 0,
      lockoutCount: 0,
      blockedUntil: undefined,
      createdAt: new Date(),
      ...overrides,
    });

  // ──────────────────────────────────────────────────────────────────────────
  // Setup
  // ──────────────────────────────────────────────────────────────────────────

  beforeEach(() => {
    jest.resetAllMocks();

    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      updatePasswordHash: jest.fn(),
    } as any;

    securityRepository = {
      registerFailedAttempt: jest.fn(),
      resetFailedLoginAttempts: jest.fn(),
      releaseTemporaryBlock: jest.fn(),
      findByUserId: jest.fn(),
      updateLastPasswordChange: jest.fn(),
    } as any;

    sessionRepository = {
      create: jest.fn(),
      countActiveSessions: jest.fn(),
      revokeOldestActiveSession: jest.fn(),
      revokeAllUserSessions: jest.fn(),
    } as any;

    refreshTokenRepository = {
      create: jest.fn(),
      revokeBySession: jest.fn(),
      findByJti: jest.fn(),
      revoke: jest.fn(),
      revokeAllByUser: jest.fn(),
    } as any;

    passwordHasher = {
      verify: jest.fn(),
      hash: jest.fn(),
    } as any;

    sessionCache = {
      storeSession: jest.fn(),
      isSessionActive: jest.fn(),
      revokeSession: jest.fn(),
    } as any;

    eventBus = {
      publish: jest.fn(),
    } as any;

    clock = {
      now: jest.fn().mockReturnValue(NOW),
    } as any;

    useCase = new ChangePasswordUseCase(
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

  // ──────────────────────────────────────────────────────────────────────────
  // Happy path
  // ──────────────────────────────────────────────────────────────────────────

  describe('flujo exitoso', () => {
    beforeEach(() => {
      userRepository.findById.mockResolvedValue(createUser());

      // Primera llamada a verify → currentPassword válida (true)
      // Segunda llamada a verify → newPassword distinta a la actual (false)
      passwordHasher.verify
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      passwordHasher.hash.mockResolvedValue('new-hash');
      userRepository.updatePasswordHash.mockResolvedValue();
      securityRepository.updateLastPasswordChange.mockResolvedValue();
      sessionRepository.revokeAllUserSessions.mockResolvedValue([
        'session-1',
        'session-2',
      ]);
      refreshTokenRepository.revokeAllByUser.mockResolvedValue();
      sessionCache.revokeSession.mockResolvedValue();
    });

    it('debe actualizar el hash de la contraseña', async () => {
      await useCase.execute('user-1', 'OldPassword123!', 'NewPassword456@', context);

      expect(passwordHasher.hash).toHaveBeenCalledWith('NewPassword456@');
      expect(userRepository.updatePasswordHash).toHaveBeenCalledWith(
        'user-1',
        'new-hash',
      );
    });

    it('debe registrar la fecha del último cambio de contraseña', async () => {
      await useCase.execute('user-1', 'OldPassword123!', 'NewPassword456@', context);

      expect(securityRepository.updateLastPasswordChange).toHaveBeenCalledWith(
        'user-1',
        NOW,
      );
    });

    it('debe revocar todas las sesiones activas en DB y sus refresh tokens en paralelo', async () => {
      await useCase.execute('user-1', 'OldPassword123!', 'NewPassword456@', context);

      expect(sessionRepository.revokeAllUserSessions).toHaveBeenCalledWith(
        'user-1',
        NOW,
      );
      expect(refreshTokenRepository.revokeAllByUser).toHaveBeenCalledWith(
        'user-1',
      );
    });

    it('debe limpiar del cache Redis cada sesión revocada', async () => {
      await useCase.execute('user-1', 'OldPassword123!', 'NewPassword456@', context);

      expect(sessionCache.revokeSession).toHaveBeenCalledTimes(2);
      expect(sessionCache.revokeSession).toHaveBeenCalledWith('session-1');
      expect(sessionCache.revokeSession).toHaveBeenCalledWith('session-2');
    });

    it('debe emitir PasswordChangedEvent con userId y contexto', async () => {
      await useCase.execute('user-1', 'OldPassword123!', 'NewPassword456@', context);

      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.any(PasswordChangedEvent),
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          context,
        }),
      );
    });

    it('no debe emitir PasswordChangeFailedEvent en flujo exitoso', async () => {
      await useCase.execute('user-1', 'OldPassword123!', 'NewPassword456@', context);

      const failedEvents = (eventBus.publish as jest.Mock).mock.calls.filter(
        ([event]) => event instanceof PasswordChangeFailedEvent,
      );

      expect(failedEvents).toHaveLength(0);
    });

    it('no debe emitir ningún evento de fallo si no hay sesiones activas', async () => {
      sessionRepository.revokeAllUserSessions.mockResolvedValue([]);

      await useCase.execute('user-1', 'OldPassword123!', 'NewPassword456@', context);

      expect(sessionCache.revokeSession).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Seguridad — validación de usuario
  // ──────────────────────────────────────────────────────────────────────────

  describe('validación del usuario', () => {
    it('debe lanzar INVALID_CURRENT_PASSWORD si el usuario no existe', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('user-1', 'OldPassword123!', 'NewPassword456@', context),
      ).rejects.toMatchObject({
        code: ErrorCode.INVALID_CURRENT_PASSWORD,
      });

      expect(passwordHasher.verify).not.toHaveBeenCalled();
      expect(userRepository.updatePasswordHash).not.toHaveBeenCalled();
    });

    it('debe lanzar INVALID_CURRENT_PASSWORD si el usuario está BLOQUEADO (sin revelar el motivo)', async () => {
      userRepository.findById.mockResolvedValue(
        createUser({ status: UserStatus.BLOCKED }),
      );

      await expect(
        useCase.execute('user-1', 'OldPassword123!', 'NewPassword456@', context),
      ).rejects.toMatchObject({
        code: ErrorCode.INVALID_CURRENT_PASSWORD,
      });

      expect(passwordHasher.verify).not.toHaveBeenCalled();
    });

    it('debe lanzar INVALID_CURRENT_PASSWORD si el usuario está PENDIENTE (sin revelar el motivo)', async () => {
      userRepository.findById.mockResolvedValue(
        createUser({ status: UserStatus.PENDING }),
      );

      await expect(
        useCase.execute('user-1', 'OldPassword123!', 'NewPassword456@', context),
      ).rejects.toMatchObject({
        code: ErrorCode.INVALID_CURRENT_PASSWORD,
      });

      expect(passwordHasher.verify).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Seguridad — validación de contraseña actual
  // ──────────────────────────────────────────────────────────────────────────

  describe('validación de contraseña actual', () => {
    it('debe lanzar INVALID_CURRENT_PASSWORD si la contraseña actual es incorrecta', async () => {
      userRepository.findById.mockResolvedValue(createUser());
      passwordHasher.verify.mockResolvedValue(false);

      await expect(
        useCase.execute('user-1', 'WrongPassword1!', 'NewPassword456@', context),
      ).rejects.toMatchObject({
        code: ErrorCode.INVALID_CURRENT_PASSWORD,
      });

      expect(userRepository.updatePasswordHash).not.toHaveBeenCalled();
    });

    it('debe emitir PasswordChangeFailedEvent con razón INVALID_CURRENT_PASSWORD', async () => {
      userRepository.findById.mockResolvedValue(createUser());
      passwordHasher.verify.mockResolvedValue(false);

      await expect(
        useCase.execute('user-1', 'WrongPassword1!', 'NewPassword456@', context),
      ).rejects.toThrow();

      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          reason: 'INVALID_CURRENT_PASSWORD',
        }),
      );
    });

    it('no debe revocar sesiones si la contraseña actual es incorrecta', async () => {
      userRepository.findById.mockResolvedValue(createUser());
      passwordHasher.verify.mockResolvedValue(false);

      await expect(
        useCase.execute('user-1', 'WrongPassword1!', 'NewPassword456@', context),
      ).rejects.toThrow();

      expect(sessionRepository.revokeAllUserSessions).not.toHaveBeenCalled();
      expect(refreshTokenRepository.revokeAllByUser).not.toHaveBeenCalled();
      expect(sessionCache.revokeSession).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Seguridad — nueva contraseña igual a la actual
  // ──────────────────────────────────────────────────────────────────────────

  describe('validación de nueva contraseña', () => {
    it('debe lanzar SAME_PASSWORD_NOT_ALLOWED si la nueva contraseña es igual a la actual', async () => {
      userRepository.findById.mockResolvedValue(createUser());

      // currentPassword válida → true
      // newPassword igual a la actual → true (mismo hash)
      passwordHasher.verify
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      await expect(
        useCase.execute('user-1', 'SamePassword1!', 'SamePassword1!', context),
      ).rejects.toMatchObject({
        code: ErrorCode.SAME_PASSWORD_NOT_ALLOWED,
      });

      expect(userRepository.updatePasswordHash).not.toHaveBeenCalled();
    });

    it('debe emitir PasswordChangeFailedEvent con razón SAME_PASSWORD_NOT_ALLOWED', async () => {
      userRepository.findById.mockResolvedValue(createUser());
      passwordHasher.verify
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      await expect(
        useCase.execute('user-1', 'SamePassword1!', 'SamePassword1!', context),
      ).rejects.toThrow();

      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          reason: 'SAME_PASSWORD_NOT_ALLOWED',
        }),
      );
    });

    it('no debe revocar sesiones si la nueva contraseña es igual a la actual', async () => {
      userRepository.findById.mockResolvedValue(createUser());
      passwordHasher.verify
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      await expect(
        useCase.execute('user-1', 'SamePassword1!', 'SamePassword1!', context),
      ).rejects.toThrow();

      expect(sessionRepository.revokeAllUserSessions).not.toHaveBeenCalled();
    });

    it('debe rechazar nueva contraseña débil antes de llegar al use case (PasswordVO)', async () => {
      userRepository.findById.mockResolvedValue(createUser());
      passwordHasher.verify.mockResolvedValueOnce(true); // currentPassword válida

      await expect(
        useCase.execute('user-1', 'OldPassword123!', 'weak', context),
      ).rejects.toThrow();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Orden de operaciones
  // ──────────────────────────────────────────────────────────────────────────

  describe('orden de operaciones', () => {
    it('debe verificar la contraseña actual antes de la nueva', async () => {
      userRepository.findById.mockResolvedValue(createUser());
      passwordHasher.verify.mockResolvedValue(false); // currentPassword inválida

      await expect(
        useCase.execute('user-1', 'WrongPassword1!', 'NewPassword456@', context),
      ).rejects.toMatchObject({
        code: ErrorCode.INVALID_CURRENT_PASSWORD,
      });

      // Solo se llamó verify una vez (para currentPassword)
      expect(passwordHasher.verify).toHaveBeenCalledTimes(1);
    });

    it('debe actualizar el hash antes de revocar sesiones', async () => {
      const callOrder: string[] = [];

      userRepository.findById.mockResolvedValue(createUser());
      passwordHasher.verify
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      passwordHasher.hash.mockResolvedValue('new-hash');

      userRepository.updatePasswordHash.mockImplementation(async () => {
        callOrder.push('updatePasswordHash');
      });
      securityRepository.updateLastPasswordChange.mockImplementation(async () => {
        callOrder.push('updateLastPasswordChange');
      });
      sessionRepository.revokeAllUserSessions.mockImplementation(async () => {
        callOrder.push('revokeAllUserSessions');
        return [];
      });
      refreshTokenRepository.revokeAllByUser.mockImplementation(async () => {
        callOrder.push('revokeAllByUser');
      });

      await useCase.execute('user-1', 'OldPassword123!', 'NewPassword456@', context);

      expect(callOrder.indexOf('updatePasswordHash')).toBeLessThan(
        callOrder.indexOf('revokeAllUserSessions'),
      );
      expect(callOrder.indexOf('updateLastPasswordChange')).toBeLessThan(
        callOrder.indexOf('revokeAllUserSessions'),
      );
    });
  });
});
